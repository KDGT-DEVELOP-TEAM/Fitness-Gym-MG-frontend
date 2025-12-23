import React, { useEffect, useState } from 'react';
import { adminLogsApi } from '../../api/admin/logsApi';
import { MainLayout } from '../../components/common/MainLayout';

export const AdminLogs: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await adminLogsApi.getLogs();
        setLogs(result.data || []);
      } catch (error) {
        console.error('Failed to fetch logs', error);
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
        <h1 className="text-2xl font-bold mb-4">監査ログ</h1>
        <pre>{JSON.stringify(logs, null, 2)}</pre>
      </div>
    </MainLayout>
  );
};
