import React from 'react';
import { useParams } from 'react-router-dom';
import { MainLayout } from '../../components/common/MainLayout';

export const AdminUserEdit: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();

  return (
    <MainLayout menuItems={[]}>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">ユーザー編集 (ID: {userId})</h1>
        {/* フォーム実装予定 */}
      </div>
    </MainLayout>
  );
};
