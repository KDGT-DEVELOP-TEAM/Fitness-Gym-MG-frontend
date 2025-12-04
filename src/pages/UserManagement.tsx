import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

export const UserManagement: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">ユーザー管理</h1>
      <div className="space-y-4">
        <Link
          to={ROUTES.USER_LIST}
          className="block p-4 border rounded-lg hover:bg-gray-50"
        >
          ユーザー一覧
        </Link>
      </div>
    </div>
  );
};

