import React from 'react';
import { useCustomers } from '../hooks/useCustomer';

export const CustomerList: React.FC = () => {
  const { customers, loading, error } = useCustomers();

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div>エラー: {error.message}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">顧客一覧</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="px-4 py-2 border">名前</th>
              <th className="px-4 py-2 border">メール</th>
              <th className="px-4 py-2 border">電話</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td className="px-4 py-2 border">{customer.name}</td>
                <td className="px-4 py-2 border">{customer.email || '-'}</td>
                <td className="px-4 py-2 border">{customer.phone || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
