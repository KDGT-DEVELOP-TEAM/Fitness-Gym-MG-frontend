import React, { useState, useEffect, useCallback } from 'react';
import useUsers from '../hooks/useUser'; 
import { useStores } from '../hooks/useStore'; 
import { UserCard } from '../components/user/UserCard'; 
import UserFormModal from '../components/user/UserFormModal'; 
import { User, UserFormData } from '../types/user';
import { useAuth } from '../context/AuthContext';
import { adminUsersApi } from '../api/admin/usersApi';
import { managerUsersApi } from '../api/manager/usersApi';

const ITEMS_PER_PAGE = 10;

export const UserManagement: React.FC = () => {
  const { user: authUser } = useAuth(); // ログイン中のユーザー情報
  const { 
    users,
    total,
    loading: usersLoading, 
    error: fetchError, 
    filters, 
    handleFilterChange, 
    refetchUsers,
  } = useUsers();
  
  const { stores } = useStores();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // --- API セレクター ---
  // ロールと所属店舗に基づいて、叩くべきAPIエンドポイントを動的に切り替える
  const getUserService = useCallback(() => {
    const isAdmin = authUser?.role?.toUpperCase() === 'ADMIN';
    // 店長の場合、所属している最初の店舗IDを使用（兼任対応が必要な場合はロジック調整）
    const storeId = Array.isArray(authUser?.storeId) ? authUser.storeId[0] : authUser?.storeId;

    return {
      create: (data: UserFormData) => 
        isAdmin ? adminUsersApi.createUser(data) : managerUsersApi.createUser(storeId!, data),
      update: (id: string, data: UserFormData) => 
        isAdmin ? adminUsersApi.updateUser(id, data) : managerUsersApi.updateUser(storeId!, id, data),
      delete: (id: string) => 
        isAdmin ? adminUsersApi.deleteUser(id) : managerUsersApi.deleteUser(storeId!, id),
    };
  }, [authUser]);

  // --- ページネーション・フィルタ制御 ---
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE) || 1;

  useEffect(() => {
    refetchUsers(currentPage - 1);
  }, [currentPage, refetchUsers]);

  useEffect(() => {
    setCurrentPage(1); // 検索条件が変わったら1ページ目に戻す
  }, [filters.nameOrKana, filters.role]);

  // --- ハンドラー ---
  const handleSubmit = async (data: UserFormData, userId?: string) => {
    setIsSubmitting(true);
    const service = getUserService();
    const targetId = userId || editingUser?.id;

    try {
      if (targetId) {
        // 更新処理（adminUsersApi.updateUser または managerUsersApi.updateUser）
        await service.update(targetId, data);
      } else {
        // 新規作成処理
        await service.create(data);
      }
      await refetchUsers(currentPage - 1); // 一覧を再取得
      setIsModalOpen(false);
    } catch (err: any) {
      // UserForm.tsx 内の catch ブロックでエラーメッセージを表示させるために例外を再送出
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (userId: string) => {
    // 削除前の最終確認
    if (!window.confirm("このユーザーを完全に削除してもよろしいですか？\n※このスタッフが担当したレッスン履歴がある場合は削除できません。")) return;
    
    setIsSubmitting(true);
    const service = getUserService();
    try {
      await service.delete(userId);
      await refetchUsers(currentPage - 1); 
      setIsModalOpen(false);
    } catch (err: any) {
      const msg = err.response?.data?.message || "削除に失敗しました。関連データを確認してください。";
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleNewClick = () => {
    setEditingUser(undefined);
    setIsModalOpen(true);
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
          className="h-12 px-6 bg-green-600 text-white font-black rounded-2xl hover:bg-green-700 shadow-xl shadow-green-100 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          新規スタッフ登録
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
          />
        </div>
        
        <select
          value={filters.role}
          onChange={(e) => handleFilterChange({ role: e.target.value })}
          className="h-14 px-6 bg-white border-2 border-gray-50 rounded-2xl text-sm font-black text-gray-600 focus:border-green-500 focus:ring-0 outline-none cursor-pointer shadow-sm transition-all"
        >
          <option value="all">全てのロール</option>
          <option value="ADMIN">管理者</option>
          <option value="MANAGER">店長</option>
          <option value="TRAINER">トレーナー</option>
        </select>
      </div>

      {/* エラー表示 */}
      {fetchError && (
        <div className="p-4 bg-red-50 text-red-600 rounded-2xl font-bold text-sm border border-red-100">
          ⚠️ エラーが発生しました: {fetchError}
        </div>
      )}

      {/* ユーザー一覧テーブル */}
      <div className="bg-white rounded-[2rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y table-fixed divide-gray-50">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="w-[30%] text-center px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">ユーザー名</th>
                <th className="w-[25%] text-center px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">権限ロール</th>
                <th className="w-[20%] text-center px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">ステータス</th>
                <th className="w-[25%] text-center px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">編集</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white">
              {usersLoading && !isSubmitting ? (
                <tr>
                  <td colSpan={4} className="py-24 text-center">
                    <div className="animate-spin h-10 w-10 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Loading Data...</p>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-24 text-center text-gray-400 font-medium">
                    ユーザーが見つかりませんでした
                  </td>
                </tr>
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
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="h-10 px-6 bg-white border border-gray-200 rounded-xl text-xs font-black text-gray-600 disabled:opacity-30 hover:bg-gray-50 transition-all shadow-sm active:scale-95"
            >
              PREV
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="h-10 px-6 bg-white border border-gray-200 rounded-xl text-xs font-black text-gray-600 disabled:opacity-30 hover:bg-gray-50 transition-all shadow-sm active:scale-95"
            >
              NEXT
            </button>
          </div>
        </div>
      )}
      
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