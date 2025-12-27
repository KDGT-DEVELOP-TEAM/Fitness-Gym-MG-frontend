import React, { useEffect, useState } from 'react';
import { adminHomeApi } from '../../api/admin/homeApi';
import { MainLayout } from '../../components/common/MainLayout';

export const AdminHome: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await adminHomeApi.getHome();
        setData(result);
      } catch (error) {
        console.error('Failed to fetch admin home data', error);
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
        <h1 className="text-2xl font-bold mb-4">管理者ホーム</h1>
        {/* データ表示 */}
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
    </MainLayout>
  );
};
