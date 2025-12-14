import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCustomer } from '../hooks/useCustomer';
import { ROUTES } from '../constants/routes';

export const CustomerProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { customer, loading, error } = useCustomer(id);

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div>エラー: {error.message}</div>;
  if (!customer) return <div>顧客が見つかりません</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">顧客プロフィール</h1>
      <div className="bg-white p-6 rounded-lg shadow mb-4">
        <h2 className="text-xl font-semibold mb-4">{customer.name}</h2>
        {customer.email && <p className="text-gray-600">メール: {customer.email}</p>}
        {customer.phone && <p className="text-gray-600">電話: {customer.phone}</p>}
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <button
          onClick={() => navigate(ROUTES.POSTURE_IMAGE_LIST.replace(':customerId', id || ''))}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          画像一覧を見る
        </button>
      </div>
    </div>
  );
};

