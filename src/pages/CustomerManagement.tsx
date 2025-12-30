import React, { useState, useEffect, useCallback } from 'react';
import { useCustomers } from '../hooks/useCustomer'; 
import { CustomerCard } from '../components/customer/CustomerCard';
import { CustomerFormModal } from '../components/customer/CustomerFormModal';
import { LoadingRow, EmptyRow } from '../components/common/TableStatusRows';
import { Customer, CustomerFormData } from '../types/customer';
import { useAuth } from '../context/AuthContext';
import { adminCustomersApi } from '../api/admin/customersApi';
import { managerCustomersApi } from '../api/manager/customersApi';

const ITEMS_PER_PAGE = 10;

export const CustomerManagement: React.FC = () => {
  const { user: authUser } = useAuth();
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

  // --- API Selector ---
  const getCustomerService = useCallback(() => {
    if (!authUser) return null;
    const isAdmin = authUser?.role?.toUpperCase() === 'ADMIN';
    const storeId = Array.isArray(authUser?.storeIds) ? authUser.storeIds[0] : authUser?.storeIds;

    return {
      create: (data: CustomerFormData) => 
        isAdmin ? adminCustomersApi.createCustomer(data) : managerCustomersApi.createCustomer(storeId!, data),
      update: (id: string, data: CustomerFormData) => 
        isAdmin ? adminCustomersApi.updateCustomer(id, data) : managerCustomersApi.updateCustomer(storeId!, id, data),
      delete: (id: string) => 
        isAdmin ? adminCustomersApi.deleteCustomer(id) : managerCustomersApi.deleteCustomer(storeId!, id),
    };
  }, [authUser]);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE) || 1;

  useEffect(() => {
    refetch(currentPage - 1);
  }, [currentPage, refetch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // --- Handlers ---
  const handleSubmit = async (formData: CustomerFormData) => {
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

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* ヘッダー */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">顧客管理</h1>
          <p className="text-sm text-gray-500 mt-1">
            <span className="font-bold text-green-600">{total}</span> 名の顧客が登録されています
          </p>
        </div>
        <button 
          onClick={handleCreateClick}
          className="inline-flex items-center justify-center px-5 py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 shadow-lg shadow-green-100 transition-all active:scale-95"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          新規顧客登録
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
            placeholder="顧客名・ふりがなで検索..."
            className="w-full h-14 bg-white border-2 border-gray-50 pl-14 pr-6 rounded-2xl focus:border-green-500 focus:ring-0 outline-none transition-all text-gray-700 font-medium shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
      <div className="bg-white rounded-[2rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-50">
            <thead className="bg-gray-50/50">
              <tr>
              <th className="w-[30%] px-8 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">顧客氏名</th>
              <th className="w-[20%] px-8 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">年齢</th>
              <th className="w-[25%] px-8 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">ステータス</th>
              <th className="w-[25%] px-8 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">編集</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                  <LoadingRow colSpan={5} /> 
                ) : customers.length === 0 ? (
                  <EmptyRow colSpan={5} message="顧客データが登録されていません" />
                ) : (
                customers.map((customer) => (
                  <CustomerCard 
                    key={customer.id} 
                    customer={customer} 
                    calculateAge={(b) => {
                      const age = new Date().getFullYear() - new Date(b).getFullYear();
                      return isNaN(age) ? 0 : age;
                    }}
                    onEdit={(c) => handleEditClick(c as Customer)} 
                  />
              )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ページネーション */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl border border-gray-100 shadow-sm">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Page {currentPage} / {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-xs font-bold rounded-xl border border-gray-200 bg-white text-gray-600 disabled:opacity-40 transition-all hover:bg-gray-50 active:scale-95"
            >
              Prev
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-xs font-bold rounded-xl border border-gray-200 bg-white text-gray-600 disabled:opacity-40 transition-all hover:bg-gray-50 active:scale-95"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* モーダル */}
      <CustomerFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={selectedCustomer}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default CustomerManagement;