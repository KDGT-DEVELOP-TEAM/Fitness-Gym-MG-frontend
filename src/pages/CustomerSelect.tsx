import React from 'react';
import { useCustomers } from '../hooks/useCustomer';
import { logger } from '../utils/logger';

export const CustomerSelect: React.FC = () => {
  const { customers, loading, error } = useCustomers();

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div>エラー: {error.message}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">顧客選択</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {customers.map((customer) => (
          <div
            key={customer.id}
            onClick={() => {
              // 統合後顧客プロフィールページへのルートを追加予定
              // Issue: 顧客プロフィール機能の実装が必要
              logger.debug('Customer profile not implemented', { customerId: customer.id }, 'CustomerSelect');
            }}
            className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
          >
            <h3 className="font-semibold">{customer.name}</h3>
            {customer.email && <p className="text-sm text-gray-600">{customer.email}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};
