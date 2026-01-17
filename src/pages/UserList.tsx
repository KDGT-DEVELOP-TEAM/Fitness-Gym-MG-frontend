import React from 'react';
import axiosInstance from '../api/axiosConfig';
import { User } from '../types/api/user';
import { useState, useEffect } from 'react';
import { LoadingSpinner } from '../components/common/TableStatusRows';

export const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const roleLabels: { [key: string]: string } = {
    ADMIN: '本部',
    MANAGER: '店長',
    TRAINER: 'トレーナー',
  };

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        // バックエンドのGET /api/usersはオプション選択用（ページングなし、全ユーザー返却）
        const response = await axiosInstance.get<User[]>('/users');
        setUsers(response.data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) return (
    <div className="p-8">
      <LoadingSpinner minHeight="min-h-[300px]" />
    </div>
  );
  if (error) return <div>エラー: {error.message}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">ユーザー一覧</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="px-4 py-2 border">名前</th>
              <th className="px-4 py-2 border">メール</th>
              <th className="px-4 py-2 border">役割</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-4 py-2 border">{user.name}</td>
                <td className="px-4 py-2 border">{user.email}</td>
                <td className="px-4 py-2 border">{roleLabels[user.role] || user.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

