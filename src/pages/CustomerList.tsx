import React, { useEffect } from 'react';
import { useCustomers } from '../hooks/useCustomer';
import { LoadingSpinner } from '../components/common/TableStatusRows';

export const CustomerList: React.FC = () => {
  const { customers, loading, error, refetch } = useCustomers();
  
  // 初期レンダリング時にデータを取得
  useEffect(() => {
    refetch(0);
  }, [refetch]);

  if (loading) return (
    <div className="p-8">
      <LoadingSpinner minHeight="min-h-[300px]" />
    </div>
  );
  
  if (error) return <div className="p-8 text-center text-red-500">エラーが発生しました: {typeof error === 'string' ? error : '不明なエラー'}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 tracking-tight text-gray-900">顧客一覧</h1>
      
      <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
        <table className="min-w-full bg-white text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left font-bold text-gray-600 border-b">名前</th>
              <th className="px-6 py-4 text-left font-bold text-gray-600 border-b">メール</th>
              <th className="px-6 py-4 text-left font-bold text-gray-600 border-b">電話</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {customers.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-gray-400 italic">
                  登録されている顧客がいません
                </td>
              </tr>
            ) : (
              customers.map((customer) => (
                <tr key={customer.id || `temp-key-${Math.random()}`} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900 border-b">{customer.name}</td>
                  <td className="px-6 py-4 text-gray-600 border-b">{customer.email || '-'}</td>
                  <td className="px-6 py-4 text-gray-600 border-b">{customer.phone || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};