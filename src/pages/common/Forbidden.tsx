import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../components/common/MainLayout';

export const Forbidden: React.FC = () => {
  const navigate = useNavigate();

  return (
    <MainLayout menuItems={[]}>
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-4 text-center">
          <div className="mb-8">
            <h1 className="text-9xl font-bold text-gray-300">403</h1>
            <h2 className="text-3xl font-semibold text-gray-800 mt-4 mb-2">
              アクセス権限がありません
            </h2>
            <p className="text-gray-600 mb-8">
              このページにアクセスするための権限がありません。
              <br />
              管理者にお問い合わせください。
            </p>
          </div>
          <div className="space-y-4">
            <button
              onClick={() => navigate(-1)}
              className="w-full px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              前のページに戻る
            </button>
            <button
              onClick={() => navigate('/login')}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              ログインページに戻る
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

