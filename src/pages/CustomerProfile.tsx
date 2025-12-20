// src/pages/CustomerProfile.tsx

import React from 'react';
import { useParams } from 'react-router-dom';
import { useCustomers } from '../hooks/useCustomer';

export const CustomerProfile: React.FC = () => {
  // const { id } = useParams<{ id: string }>();
  // const { customer, loading, error } = useCustomers(id);

  // if (loading) return <div className="p-6">読み込み中...</div>;
  // if (error) return <div className="p-6 text-red-500">エラー: {error.message}</div>;
  // if (!customer) return <div className="p-6">顧客が見つかりません。</div>;

  return (
    <div className="p-6">
      {/* <h1 className="text-2xl font-bold mb-4">{customer.name} 様のプロフィール</h1> */}
      <div className="bg-white p-6 rounded-lg shadow space-y-2">
        {/* <p><strong>ふりがな:</strong> {customer.kana}</p>
        <p><strong>メール:</strong> {customer.email}</p>
        <p><strong>禁忌事項:</strong> <span className="text-red-600">{customer.taboo || 'なし'}</span></p> */}
        {/* その他の項目を表示 */}
      </div>
    </div>
  );
};