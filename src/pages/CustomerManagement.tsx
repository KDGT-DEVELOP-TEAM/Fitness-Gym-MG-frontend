import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomers } from '../hooks/useCustomer'; 
import { CustomerCard } from '../components/customer/CustomerCard';
import { CustomerFormModal } from '../components/customer/CustomerFormModal';
import { LoadingRow, EmptyRow } from '../components/common/TableStatusRows';
import { Pagination } from '../components/common/Pagination';
import { Customer, CustomerRequest } from '../types/api/customer';
import { useAuth } from '../context/AuthContext';
import { adminCustomersApi } from '../api/admin/customersApi';
import { managerCustomersApi } from '../api/manager/customersApi';
import { customerApi } from '../api/customerApi';
import { ROUTES } from '../constants/routes';

const ITEMS_PER_PAGE = 10;

export const CustomerManagement: React.FC = () => {
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  const { 
    customers,
    total,
    loading, 
    error: fetchError, 
    searchQuery, 
    setSearchQuery,
    refetch,
  } = useCustomers();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // トレーナーの場合は編集・作成機能を無効化
  const isTrainer = authUser?.role?.toUpperCase() === 'TRAINER';

  // --- API Selector ---
  const getCustomerService = useCallback(() => {
    if (!authUser) return null;
    const isAdmin = authUser?.role?.toUpperCase() === 'ADMIN';
    const storeId = Array.isArray(authUser?.storeIds) ? authUser.storeIds[0] : authUser?.storeIds;

    return {
      create: (data: CustomerRequest) => 
        isAdmin ? adminCustomersApi.createCustomer(data) : managerCustomersApi.createCustomer(data),
      update: (id: string, data: CustomerRequest) => 
        customerApi.updateProfile(id, data),
      delete: (id: string) => 
        isAdmin ? adminCustomersApi.deleteCustomer(id) : managerCustomersApi.deleteCustomer(storeId!, id),
    };
  }, [authUser]);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE) || 1;

  // トレーナーの場合、refetchの依存を最適化（storesLoadingの変更による再実行を防ぐ）
  // useRefを使ってrefetchの最新バージョンを保持
  const refetchRef = useRef(refetch);
  useEffect(() => {
    refetchRef.current = refetch;
  }, [refetch]);

  useEffect(() => {
    // トレーナーの場合、refetchの変更を無視して、currentPageとsearchQueryの変更時のみ実行
    // ADMIN/MANAGERの場合、refetchの変更も監視
    if (isTrainer) {
      refetchRef.current(currentPage - 1);
    } else {
      refetch(currentPage - 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, isTrainer ? undefined : refetch, isTrainer]); // トレーナーの場合、refetchを依存から除外

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // --- Handlers ---
  const handleSubmit = async (formData: CustomerRequest) => {
    setIsSubmitting(true);
    const service = getCustomerService();
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

  const handleDelete = async (customerId: string) => {
    if (!window.confirm("この顧客データを完全に削除してもよろしいですか？\n※レッスン履歴がある場合は削除できません。")) return;
    
    setIsSubmitting(true);
    const service = getCustomerService();
    if (!service) return;
    try {
      await service.delete(customerId);
      await refetch(currentPage - 1);
      setIsModalOpen(false);
    } catch (err: any) {
      const msg = err.response?.data?.message || "削除に失敗しました。ステータスを無効にするか、関連データを確認してください。";
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
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
            {isTrainer ? '顧客一覧' : '顧客管理'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            <span className="font-bold text-green-600">{total}</span> 名の顧客が登録されています
          </p>
        </div>
        {!isTrainer && (
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
        {/* 必要であればここに性別フィルタなどの select を追加可能 */}
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
              <th className="w-[30%] px-8 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">氏名</th>
              <th className="w-[20%] px-8 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">年齢</th>
              <th className="w-[25%] px-8 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">ステータス</th>
              {!isTrainer && (
                <th className="w-[25%] px-8 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">編集</th>
              )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                  <LoadingRow colSpan={isTrainer ? 3 : 4} /> 
                ) : customers.length === 0 ? (
                  <EmptyRow colSpan={isTrainer ? 3 : 4} message="顧客データが登録されていません" />
                ) : (
                customers.map((customer) => (
                  <CustomerCard 
                    key={customer.id} 
                    customer={customer} 
                    calculateAge={(b) => {
                      const age = new Date().getFullYear() - new Date(b).getFullYear();
                      return isNaN(age) ? 0 : age;
                    }}
                    onEdit={isTrainer ? undefined : (c) => handleEditClick(c as Customer)}
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
      {!isTrainer && (
        <CustomerFormModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          initialData={selectedCustomer}
          onSubmit={handleSubmit}
          onDelete={handleDelete}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
};

export default CustomerManagement;