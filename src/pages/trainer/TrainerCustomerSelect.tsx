import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { trainerCustomersApi } from '../../api/trainer/customersApi';
import { MainLayout } from '../../components/common/MainLayout';

export const TrainerCustomerSelect: React.FC = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.storeId) return;
    const fetchData = async () => {
      try {
        const result = await trainerCustomersApi.getCustomers(user.storeId!);
        setCustomers(Array.isArray(result) ? result : []);
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
        <h1 className="text-2xl font-bold mb-4">顧客選択</h1>
        <pre>{JSON.stringify(customers, null, 2)}</pre>
      </div>
    </MainLayout>
  );
};
