import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

export const CustomerManagement: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">顧客管理</h1>
      <div className="space-y-4">
        <Link
          to={ROUTES.CUSTOMER_LIST}
          className="block p-4 border rounded-lg hover:bg-gray-50"
        >
          顧客一覧
        </Link>
        <Link
          to={ROUTES.CUSTOMER_SELECT}
          className="block p-4 border rounded-lg hover:bg-gray-50"
        >
          顧客選択
        </Link>
      </div>
    </div>
  );
};

