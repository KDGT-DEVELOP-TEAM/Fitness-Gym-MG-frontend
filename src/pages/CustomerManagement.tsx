import React, { useState, useMemo, useEffect } from 'react';
import { useCustomers } from '../hooks/useCustomer'; 
import { CustomerCard } from '../components/customer/CustomerCard';
import { CustomerFormModal } from '../components/customer/CustomerFormModal';
import { Customer, CustomerFormData } from '../types/customer';

const ITEMS_PER_PAGE = 10;

export const CustomerManagement: React.FC = () => {
  const { 
    customers, 
    loading, 
    error, 
    searchQuery, 
    setSearchQuery, 
    calculateAge, 
    createCustomer,
    updateCustomer,
    deleteCustomer,
  } = useCustomers();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // --- 1. ソート & ページネーションロジック ---
  const { paginatedCustomers, totalPages, totalCount } = useMemo(() => {
    // 作成日時の降順（新しい順）でソート
    const sorted = [...customers].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    const pages = Math.ceil(sorted.length / ITEMS_PER_PAGE);
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    
    return {
      paginatedCustomers: sorted.slice(start, start + ITEMS_PER_PAGE),
      totalPages: pages || 1,
      totalCount: sorted.length
    };
  }, [customers, currentPage]);

  // 検索ワードが変わったら1ページ目に戻す
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // --- 2. ハンドラー関数 ---
  const handleSubmit = async (formData: CustomerFormData) => {
    setIsSubmitting(true);
    try {
      if (selectedCustomer) {
        await updateCustomer(formData, selectedCustomer.id);
      } else {
        await createCustomer(formData);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error("Save Error:", err);
      alert("保存に失敗しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (customerId: string) => {
    if (!window.confirm("この顧客データを完全に削除してもよろしいですか？")) return;
    
    setIsSubmitting(true);
    try {
      await deleteCustomer(customerId);
      setIsModalOpen(false);
    } catch (err) {
      alert("削除に失敗しました。");
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
            <span className="font-bold text-green-600">{totalCount}</span> 名の顧客が登録されています
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
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl font-bold text-sm">
          ⚠️ {error}
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
              {paginatedCustomers.map((customer) => (
                <CustomerCard 
                  key={customer.id} 
                  customer={customer} 
                  calculateAge={calculateAge} 
                  onEdit={handleEditClick} 
                />
              ))}
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