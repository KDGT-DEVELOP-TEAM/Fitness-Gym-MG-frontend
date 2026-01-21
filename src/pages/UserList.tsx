import React, { useState, useEffect } from 'react';
import { User } from '../types/api/user';
import { LoadingSpinner, EmptyRow } from '../components/common/TableStatusRows';
import { ErrorDisplay } from '../components/common/ErrorDisplay';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { adminUsersApi } from '../api/admin/usersApi';
import { logger } from '../utils/logger';

export const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { handleError } = useErrorHandler();

  const roleLabels: { [key: string]: string } = {
    ADMIN: '本部',
    MANAGER: '店長',
    TRAINER: 'トレーナー',
  };

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        // バックエンドのGET /api/usersはオプション選択用（ページングなし、全ユーザー返却）
        const usersData = await adminUsersApi.getAllUsers();
        setUsers(usersData);
        logger.debug('Fetched users', { count: usersData.length }, 'UserList');
      } catch (err) {
        const errorMessage = handleError(err, 'UserList');
        setError(errorMessage);
        logger.error('Failed to fetch users', err, 'UserList');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [handleError]);

  if (loading) {
    return (
      <div className="p-8">
        <LoadingSpinner minHeight="min-h-[300px]" />
      </div>
    );
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* ヘッダー */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">ユーザー一覧</h1>
          <p className="text-sm text-gray-500 mt-1">
            <span className="font-bold text-green-600">{users.length}</span> 名のユーザーが登録されています
          </p>
        </div>
      </div>

      {/* テーブル */}
      <div className="bg-white rounded-[2rem] shadow-sm border-2 border-gray-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-50">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="w-[30%] px-8 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">名前</th>
                <th className="w-[35%] px-8 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">メール</th>
                <th className="w-[35%] px-8 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">役割</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white">
              {users.length === 0 ? (
                <EmptyRow colSpan={3} message="登録されているユーザーがいません" />
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-6 text-center">
                      <div className="font-black text-gray-900 text-base">{user.name}</div>
                    </td>
                    <td className="px-8 py-6 text-center text-gray-600 text-sm">{user.email || '-'}</td>
                    <td className="px-8 py-6 text-center text-gray-600 text-sm">
                      {roleLabels[user.role] || user.role}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

