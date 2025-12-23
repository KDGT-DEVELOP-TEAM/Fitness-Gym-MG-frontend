import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { managerHomeApi } from '../../api/manager/homeApi';
import { MainLayout } from '../../components/common/MainLayout';

export const ManagerHome: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.storeId) return;
    const fetchData = async () => {
      try {
        const result = await managerHomeApi.getHome(user.storeId!);
        setData(result);
      } catch (error) {
        console.error('Failed to fetch manager home data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) return <div>Loading...</div>;

  return (
    <MainLayout menuItems={[]}>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">店長ホーム</h1>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
    </MainLayout>
  );
};
