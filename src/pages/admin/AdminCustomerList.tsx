import React, { useEffect, useState } from 'react';
import { adminCustomersApi } from '../../api/admin/customersApi';
import { MainLayout } from '../../components/common/MainLayout';

export const AdminCustomerList: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await adminCustomersApi.getCustomers();
        setCustomers(result.data || []);
      } catch (error) {
        console.error('Failed to fetch customers', error);
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
        <h1 className="text-2xl font-bold mb-4">顧客一覧</h1>
        <pre>{JSON.stringify(customers, null, 2)}</pre>
      </div>
    </MainLayout>
  );
};
