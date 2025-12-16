import React from 'react';
import { useParams } from 'react-router-dom';
import { useCustomer } from '../hooks/useCustomer';

export const CustomerProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { customer, loading, error } = useCustomer(id);

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div>エラー: {error.message}</div>;
  if (!customer) return <div>顧客が見つかりません</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">顧客プロフィール</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">{customer.name}</h2>
        <p className="text-gray-600">メール: {customer.email}</p>
        <p className="text-gray-600">電話: {customer.phone}</p>
      </div>
    </div>
  );
};
