import React, { useEffect, useState } from 'react';
import { adminUsersApi } from '../../api/admin/usersApi';
import { MainLayout } from '../../components/common/MainLayout';

export const AdminUserList: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await adminUsersApi.getUsers();
        setUsers(result.data || []);
      } catch (error) {
        console.error('Failed to fetch users', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <MainLayout menuItems={[]}>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">ユーザー一覧</h1>
        {/* ユーザーリスト表示 */}
        <pre>{JSON.stringify(users, null, 2)}</pre>
      </div>
    </MainLayout>
  );
};
