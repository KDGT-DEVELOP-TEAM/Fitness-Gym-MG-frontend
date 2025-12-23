import React, { useEffect, useState } from 'react';
import { trainerHomeApi } from '../../api/trainer/homeApi';
import { MainLayout } from '../../components/common/MainLayout';

export const TrainerHome: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await trainerHomeApi.getHome();
        setData(result);
      } catch (error) {
        console.error('Failed to fetch trainer home data', error);
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
        <h1 className="text-2xl font-bold mb-4">トレーナーホーム</h1>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
    </MainLayout>
  );
};
