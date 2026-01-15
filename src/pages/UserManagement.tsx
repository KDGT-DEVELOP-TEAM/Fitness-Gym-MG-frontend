import React, { useState, useEffect, useCallback, useRef } from 'react';
import useUsers from '../hooks/useUser'; 
import { useStores } from '../hooks/useStore'; 
import { UserCard } from '../components/user/UserCard'; 
import UserFormModal from '../components/user/UserFormModal'; 
import { LoadingRow, EmptyRow } from '../components/common/TableStatusRows';
import { Pagination } from '../components/common/Pagination';
import { UserRole, User, UserRequest, UserListItem } from '../types/api/user'; // UserRequestを使用
import { useAuth } from '../context/AuthContext';
import { adminUsersApi } from '../api/admin/usersApi';
import { managerUsersApi } from '../api/manager/usersApi';

const ITEMS_PER_PAGE = 10;

export const UserManagement: React.FC = () => {
  const { user: authUser } = useAuth();
  const { stores, loading: storesLoading } = useStores(); // UserFormModalで使用するため保持
  const isManager = authUser?.role?.toUpperCase() === 'MANAGER';
  const [selectedStoreId, setSelectedStoreId] = useState<string>('');
  
  // マネージャーがアクセス可能な店舗のリスト
  const accessibleStores = React.useMemo(() => {
    if (!stores || stores.length === 0) return [];
    // MANAGERの場合は全店舗を表示（ADMINと同じ）
    if (isManager) {
      return stores;
    }
    // その他のロールは従来通り
    if (!authUser?.storeIds) return [];
    const userStoreIds = Array.isArray(authUser.storeIds) ? authUser.storeIds : [authUser.storeIds];
    return stores.filter(store => userStoreIds.includes(store.id));
  }, [authUser?.storeIds, stores, isManager]);

  // 初期値の設定
  useEffect(() => {
    if (storesLoading) return; // storesの読み込みが完了するまで待つ
    
    if (accessibleStores.length > 0 && !selectedStoreId) {
      // accessibleStoresが利用可能で、selectedStoreIdが未設定の場合のみ設定
      setSelectedStoreId(accessibleStores[0].id);
    } else if (authUser?.storeIds && authUser.storeIds.length > 0 && !selectedStoreId) {
      const initialStoreId = Array.isArray(authUser.storeIds) ? authUser.storeIds[0] : authUser.storeIds;
      setSelectedStoreId(initialStoreId);
    }
  }, [authUser?.storeIds, stores, storesLoading, accessibleStores, selectedStoreId]);

  const { 
    users,
    total,
    loading,
    error: fetchError, 
    filters, 
    handleFilterChange, 
    refetchUsers,
  } = useUsers(isManager ? selectedStoreId : undefined);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // --- API セレクター ---
  // 引数の型を UserRequest に変更
  const getUserService = useCallback(() => {
    if (!authUser) return null;
    const isAdmin = authUser?.role?.toUpperCase() === 'ADMIN';
    const storeId = Array.isArray(authUser.storeIds) 
      ? authUser.storeIds[0] 
      : authUser.storeIds;

    return {
      create: (request: UserRequest) => 
        isAdmin ? adminUsersApi.createUser(request) : managerUsersApi.createUser(storeId!, request),
      update: (id: string, request: UserRequest) => 
        isAdmin ? adminUsersApi.updateUser(id, request) : managerUsersApi.updateUser(storeId!, id, request),
      delete: (id: string) => 
        isAdmin ? adminUsersApi.deleteUser(id) : managerUsersApi.deleteUser(storeId!, id),
    };
  }, [authUser]);

  // --- ページネーション・フィルタ制御 ---
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE) || 1;

  // refetchUsersの最新バージョンをrefで保持
  const refetchUsersRef = useRef(refetchUsers);
  useEffect(() => {
    refetchUsersRef.current = refetchUsers;
  }, [refetchUsers]);

  useEffect(() => {
    // useUser.tsのuseEffectで自動的にデータを取得するため、ここでは初期フェッチを行わない
    // ページ変更時のみrefetchを実行
    refetchUsersRef.current(currentPage - 1);
  }, [currentPage]); // currentPageの変更時のみ実行

  useEffect(() => {
    setCurrentPage(1);
  }, [filters.nameOrKana, filters.role, selectedStoreId]);

  // --- ハンドラー ---
  const handleEditClick = async (userItem: UserListItem) => {
    if (!authUser) return;
    setIsSubmitting(true);
    try {
      const isAdmin = authUser?.role === 'ADMIN';
      const storeId = Array.isArray(authUser?.storeIds) ? authUser.storeIds[0] : authUser?.storeIds;
      
      const fullUserData = isAdmin 
        ? await adminUsersApi.getUser(userItem.id)
        : await managerUsersApi.getUser(storeId!, userItem.id);

      setEditingUser(fullUserData);
      setIsModalOpen(true);
    } catch (err) {
      alert("ユーザー詳細の取得に失敗しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 引数を UserRequest に変更。UserForm側ですでに変換済みのため、ここではそのままAPIに渡す
  const handleSubmit = async (requestData: UserRequest) => {
    setIsSubmitting(true);
    const service = getUserService();
    if (!service) return;

    try {
      if (editingUser) {
        await service.update(editingUser.id, requestData);
      } else {
        await service.create(requestData);
      }
      await refetchUsers(currentPage - 1);
      setIsModalOpen(false);
    } catch (err: unknown) {
      // UserForm 内でキャッチしてエラーメッセージを出すために再送出
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (userId: string) => {
    // 削除確認は UserForm 内の window.confirm でも行っているが、念のためこちらでも保持
    setIsSubmitting(true);
    const service = getUserService();
    if (!service) return;
    try {
      await service.delete(userId);
      await refetchUsers(currentPage - 1); 
      setIsModalOpen(false);
    } catch (err: any) {
      const msg = err.response?.data?.message || "削除に失敗しました。";
      alert(msg);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* ヘッダー */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">ユーザー管理</h1>
          <p className="text-sm text-gray-500 mt-1">
            <span className="font-bold text-green-600">{total}</span> 名のユーザーが登録されています
          </p>
        </div>
        <button
          onClick={() => { setEditingUser(undefined); setIsModalOpen(true); }}
          className="h-12 px-6 bg-[#7AB77A] text-white font-black rounded-2xl hover:bg-[rgba(122,183,122,0.9)] transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          新規ユーザー作成
        </button>
      </div>
      
      {/* 検索・フィルタ */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow group">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-400 group-focus-within:text-green-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="スタッフ名で検索..."
            value={filters.nameOrKana}
            onChange={(e) => handleFilterChange({ nameOrKana: e.target.value })}
            className="w-full h-14 bg-white border-2 border-gray-50 pl-14 pr-6 rounded-2xl focus:border-green-500 focus:ring-0 outline-none transition-all text-gray-700 font-medium shadow-sm"
            maxLength={100}
          />
        </div>
        
        <select
          value={filters.role}
          onChange={(e) => handleFilterChange({ role: e.target.value as UserRole | "all" })}
          className="h-14 px-6 bg-white border-2 border-gray-50 rounded-2xl text-sm font-black text-gray-600 focus:border-green-500 focus:ring-0 outline-none cursor-pointer shadow-sm transition-all"
        >
          <option value="all">全権限</option>
          <option value="ADMIN">管理者</option>
          <option value="MANAGER">店長</option>
          <option value="TRAINER">トレーナー</option>
        </select>
        {/* 店舗選択ドロップダウン（MANAGERロールの場合のみ表示） */}
        {isManager && (
          <div className="relative group">
            <select 
              className="h-14 pl-6 pr-10 bg-white border-2 border-gray-50 rounded-2xl text-sm font-black text-gray-600 focus:border-green-500 focus:ring-0 outline-none cursor-pointer shadow-sm transition-all hover:border-gray-200 appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
              value={selectedStoreId}
              onChange={(e) => {
                setSelectedStoreId(e.target.value);
                setCurrentPage(1);
              }}
              disabled={storesLoading || accessibleStores.length === 0}
            >
              {accessibleStores.length === 0 ? (
                <option value="">店舗を読み込み中...</option>
              ) : (
                accessibleStores.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))
              )}
            </select>
            {/* カスタム矢印アイコン */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"/>
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* エラー表示 */}
      {fetchError && (
        <div className="p-4 bg-red-50 text-red-600 rounded-2xl font-bold text-sm border border-red-100">
          ⚠️ エラーが発生しました: {fetchError}
        </div>
      )}

      {/* ユーザー一覧テーブル */}
      <div className="bg-white rounded-[2rem] shadow-sm border-2 border-gray-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y table-fixed divide-gray-50">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="w-[30%] text-center px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">ユーザー名</th>
                <th className="w-[25%] text-center px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">権限</th>
                <th className="w-[20%] text-center px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">ステータス</th>
                <th className="w-[25%] text-center px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">編集</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white">
              {loading ? (
                <LoadingRow colSpan={5} /> 
              ) : users.length === 0 ? (
                <EmptyRow colSpan={5} message="ユーザーデータが登録されていません" />
              ) : (
                users.map((user) => (
                  <UserCard 
                    key={user.id} 
                    user={user} 
                    onEdit={handleEditClick} 
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ページネーション */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
      
      {/* モーダル */}
      <UserFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingUser}
        stores={stores} 
        onSubmit={handleSubmit}
        onDelete={handleDelete} 
        isSubmitting={isSubmitting} 
      />
    </div>
  );
};

export default UserManagement;