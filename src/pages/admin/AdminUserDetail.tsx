import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { adminUsersApi } from '../../api/admin/usersApi';
import { MainLayout } from '../../components/common/MainLayout';

export const AdminUserDetail: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const fetchData = async () => {
      try {
        const result = await adminUsersApi.getUser(userId);
        setUser(result);
      } catch (error) {
        console.error('Failed to fetch user', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  if (loading) return <div>Loading...</div>;

  return (
    <MainLayout menuItems={[]}>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">ユーザー詳細</h1>
        <pre>{JSON.stringify(user, null, 2)}</pre>
      </div>
    </MainLayout>
  );
};
