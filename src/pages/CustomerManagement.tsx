import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomers } from '../hooks/useCustomer'; 
import { CustomerCard } from '../components/customer/CustomerCard';
import { CustomerFormModal } from '../components/customer/CustomerFormModal';
import { LoadingRow, EmptyRow } from '../components/common/TableStatusRows';
import { Pagination } from '../components/common/Pagination';
import { Customer, CustomerRequest } from '../types/api/customer';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../constants/routes';
import { useStores } from '../hooks/useStore';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { isAdmin, isManager, isTrainer } from '../utils/roleUtils';
import { getAccessibleStores, getInitialStoreId } from '../utils/storeUtils';
import { calculateAge } from '../utils/dateFormatter';
import { getCustomerService } from '../utils/apiSelector';

const ITEMS_PER_PAGE = 10;

export const CustomerManagement: React.FC = () => {
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  const { stores, loading: storesLoading } = useStores();
  // ADMINの場合は'all'も選択可能、MANAGER/TRAINERの場合は店舗IDのみ
  const [selectedStoreId, setSelectedStoreId] = useState<'all' | string>('');
  
  // トレーナーの場合は編集・作成機能を無効化
  const userIsTrainer = isTrainer(authUser);
  const userIsManager = isManager(authUser);
  const userIsAdmin = isAdmin(authUser);
  
  // ADMIN/MANAGER/TRAINERがアクセス可能な店舗のリスト
  const accessibleStores = React.useMemo(() => {
    return getAccessibleStores(authUser, stores);
  }, [authUser, stores]);

  // 初期値の設定
  useEffect(() => {
    if (storesLoading) return; // storesの読み込みが完了するまで待つ
    
    if (!selectedStoreId) {
      const initialStoreId = getInitialStoreId(authUser, accessibleStores, userIsAdmin);
      if (initialStoreId) {
        setSelectedStoreId(initialStoreId);
      }
    }
  }, [authUser, stores, storesLoading, accessibleStores, selectedStoreId, userIsAdmin]);

  // useCustomersに渡すstoreId: ADMINの場合は'all'の時はundefined、MANAGER/TRAINERの場合はselectedStoreId
  const storeIdForApi = React.useMemo(() => {
    if (userIsAdmin) {
      return selectedStoreId === 'all' ? undefined : selectedStoreId;
    } else if (userIsManager || userIsTrainer) {
      return selectedStoreId || undefined;
    }
    return undefined;
  }, [userIsAdmin, userIsManager, userIsTrainer, selectedStoreId]);

  const { 
    customers,
    total,
    loading, 
    error: fetchError, 
    searchQuery, 
    setSearchQuery,
    refetch,
  } = useCustomers(storeIdForApi);
  
  // refetchとsearchQueryをrefで保持（useEffectの依存配列から除外するため）
  const refetchRef = useRef(refetch);
  const searchQueryRef = useRef(searchQuery);
  
  useEffect(() => {
    refetchRef.current = refetch;
  }, [refetch]);
  
  useEffect(() => {
    searchQueryRef.current = searchQuery;
  }, [searchQuery]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [pendingDeleteCustomerId, setPendingDeleteCustomerId] = useState<string | null>(null);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE) || 1;

  // フィルタ変更時にページをリセット
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStoreId]);

  // ページ変更時またはフィルタ変更時にデータを再取得（統合版）
  const lastFetchKeyRef = useRef<string>('');
  useEffect(() => {
    // storesの読み込みが完了するまで待つ（MANAGER/TRAINERの場合）
    if ((userIsManager || userIsTrainer) && storesLoading) {
      return;
    }
    
    // selectedStoreIdが設定されていない場合は待つ（MANAGER/TRAINERの場合）
    if ((userIsManager || userIsTrainer) && !selectedStoreId) {
      return;
    }
    
    const fetchKey = `${currentPage}-${searchQueryRef.current}-${selectedStoreId || 'all'}`;
    
    // 既に同じ条件で取得済みの場合は実行しないガード
    if (lastFetchKeyRef.current === fetchKey) {
      return;
    }
    
    lastFetchKeyRef.current = fetchKey;
    refetchRef.current(currentPage - 1);
  }, [currentPage, searchQuery, selectedStoreId, userIsManager, userIsTrainer, storesLoading]); // refetchを依存配列から除外

  // --- Handlers ---
  const handleSubmit = async (formData: CustomerRequest) => {
    setIsSubmitting(true);
    const service = getCustomerService(authUser);
    if (!service) return;
    try {
      if (selectedCustomer) {
        await service.update(selectedCustomer.id, formData);
      } else {
        await service.create(formData);
      }
      await refetch(currentPage - 1); 
      setIsModalOpen(false);
    } catch (err: any) {
      // フォーム側(CustomerForm)の catch でエラーを表示させるため throw する
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = async (customerId: string): Promise<void> => {
    setPendingDeleteCustomerId(customerId);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!pendingDeleteCustomerId) return;
    
    setIsSubmitting(true);
    setShowDeleteConfirm(false);
    const service = getCustomerService(authUser);
    if (!service) {
      setIsSubmitting(false);
      return;
    }
    try {
      await service.delete(pendingDeleteCustomerId);
      await refetch(currentPage - 1);
      setIsModalOpen(false);
      setPendingDeleteCustomerId(null);
    } catch (err: any) {
      const msg = err.response?.data?.message || "削除に失敗しました。ステータスを無効にするか、関連データを確認してください。";
      setErrorMessage(msg);
      setShowErrorModal(true);
      setPendingDeleteCustomerId(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setPendingDeleteCustomerId(null);
  };

  const handleErrorModalClose = () => {
    setShowErrorModal(false);
    setErrorMessage('');
  };

  const handleEditClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const handleCreateClick = () => {
    setSelectedCustomer(undefined);
    setIsModalOpen(true);
  };

  const handleHistoryClick = (customerId: string) => {
    if (!authUser) return;
    const role = authUser.role?.toUpperCase() || 'TRAINER';
    let historyPath: string;
    switch (role) {
      case 'ADMIN':
        historyPath = ROUTES.LESSON_HISTORY_ADMIN.replace(':customerId', customerId);
        break;
      case 'MANAGER':
        historyPath = ROUTES.LESSON_HISTORY_MANAGER.replace(':customerId', customerId);
        break;
      case 'TRAINER':
      default:
        historyPath = ROUTES.LESSON_HISTORY_TRAINER.replace(':customerId', customerId);
        break;
    }
    navigate(historyPath);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* ヘッダー */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            {userIsTrainer ? '顧客一覧' : '顧客管理'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            <span className="font-bold text-green-600">{total}</span> 名の顧客が登録されています
          </p>
        </div>
        {!userIsTrainer && (
          <button 
            onClick={handleCreateClick}
            className="h-12 px-6 bg-[#7AB77A] text-white font-black rounded-2xl hover:bg-[rgba(122,183,122,0.9)] transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            新規顧客登録
          </button>
        )}
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
            placeholder="顧客名・フリガナで検索..."
            className="w-full h-14 bg-white border-2 border-gray-50 pl-14 pr-6 rounded-2xl focus:border-green-500 focus:ring-0 outline-none transition-all text-gray-700 font-medium shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            maxLength={100}
          />
        </div>
        {/* 店舗選択ドロップダウン（ADMIN/MANAGER/TRAINERロールの場合に表示） */}
        {(userIsAdmin || userIsManager || userIsTrainer) && (
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
              {storesLoading ? (
                <option value="">店舗を読み込み中...</option>
              ) : accessibleStores.length === 0 ? (
                <option value="">店舗がありません</option>
              ) : (
                <>
                  {userIsAdmin && <option value="all">全店舗</option>}
                  {accessibleStores.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </>
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

      {/* テーブル */}
      <div className="bg-white rounded-[2rem] shadow-sm border-2 border-gray-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-50">
            <thead className="bg-gray-50/50">
              <tr>
              <th className="w-[25%] px-8 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">氏名</th>
              <th className="w-[15%] px-8 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">年齢</th>
              <th className="w-[20%] px-8 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">店舗</th>
              <th className="w-[20%] px-8 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">ステータス</th>
              {!userIsTrainer && (
                <th className="w-[20%] px-8 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">編集</th>
              )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                  <LoadingRow colSpan={userIsTrainer ? 4 : 5} /> 
                ) : customers.length === 0 ? (
                  <EmptyRow colSpan={userIsTrainer ? 4 : 5} message="顧客データが登録されていません" />
                ) : (
                customers.map((customer) => (
                  <CustomerCard 
                    key={customer.id} 
                    customer={customer} 
                    calculateAge={calculateAge}
                    onEdit={userIsTrainer ? undefined : (c) => handleEditClick(c as Customer)}
                    onHistoryClick={handleHistoryClick}
                  />
              )))}
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

      {/* モーダル（トレーナーの場合は表示しない） */}
      {!userIsTrainer && (
        <CustomerFormModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          initialData={selectedCustomer}
          onSubmit={handleSubmit}
          onDelete={handleDeleteClick}
          isSubmitting={isSubmitting}
        />
      )}

      {/* 削除確認モーダル */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="顧客データの削除"
        message="この顧客データを完全に削除してもよろしいですか？\n※レッスン履歴がある場合は削除できません。"
        confirmText="削除"
        cancelText="キャンセル"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        isLoading={isSubmitting}
      />

      {/* エラーモーダル */}
      <ConfirmModal
        isOpen={showErrorModal}
        title="エラー"
        message={errorMessage}
        confirmText="了解"
        cancelText=""
        onConfirm={handleErrorModalClose}
        onCancel={handleErrorModalClose}
        isLoading={false}
      />
    </div>
  );
};

export default CustomerManagement;