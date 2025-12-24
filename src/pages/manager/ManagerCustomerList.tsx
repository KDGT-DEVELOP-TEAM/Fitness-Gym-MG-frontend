import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { managerCustomersApi } from '../../api/manager/customersApi';
import { MainLayout } from '../../components/common/MainLayout';

export const ManagerCustomerList: React.FC = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: storeIdはLoginResponseから削除されたため、別のAPIエンドポイントから取得する必要があります
    // 例: /api/users/{userId}/store など
    // 現時点では、storeIdが取得できないため、このコンポーネントは動作しません
    const storeId = (user as any)?.storeId;
    if (!storeId) return;
    const fetchData = async () => {
      try {
        const result = await managerCustomersApi.getCustomers(storeId);
        setCustomers(result.data || []);
      } catch (error) {
        console.error('Failed to fetch customers', error);
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
        <h1 className="text-2xl font-bold mb-4">顧客一覧</h1>
        <pre>{JSON.stringify(customers, null, 2)}</pre>
      </div>
    </MainLayout>
  );
};
