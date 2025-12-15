import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MainLayout } from './components/common/MainLayout';
import { Loading } from './components/common/Loading';
import { ROUTES } from './constants/routes';
import { Login } from './pages/Login';
import { LessonForm } from './pages/LessonForm';
import { LessonDetail } from './pages/LessonDetail';
import { PostureCompare } from './pages/PostureCompare';
import { usePostureImageList } from './pages/PostureImageList';
import { HiHome } from 'react-icons/hi';

// React Icons workaround for TypeScript strict mode
const HomeIcon = HiHome as React.ComponentType<{ className?: string }>;

// ページごとのメニュー項目（顧客未選択時）
const defaultMenuItems = [
  { path: ROUTES.LESSON_FORM, label: 'Home', icon: <HomeIcon className="w-5 h-5" /> },
];

const PrivateRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { authLoading, isAuthenticated } = useAuth();

  if (authLoading) {
    return <Loading />;
  }

  // 認証チェック: 常に有効化（セキュリティのため）
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return children;
};

// PostureImageList用のラッパーコンポーネント
const PostureImageListWrapper: React.FC = () => {
  const { header, content } = usePostureImageList();
  return (
    <MainLayout menuItems={defaultMenuItems} header={header}>
      {content}
    </MainLayout>
  );
};

const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path={ROUTES.LOGIN} element={<Login />} />
          <Route path="/lesson-form" element={<Navigate to={ROUTES.LESSON_FORM} replace />} />
          <Route
            path={ROUTES.LESSON_FORM}
            element={
              <PrivateRoute>
                <MainLayout menuItems={defaultMenuItems}>
                  <LessonForm />
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path={ROUTES.LESSON_DETAIL}
            element={
              <PrivateRoute>
                <MainLayout menuItems={defaultMenuItems}>
                  <LessonDetail />
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path={ROUTES.POSTURE_COMPARE}
            element={
              <PrivateRoute>
                <MainLayout menuItems={defaultMenuItems}>
                  <PostureCompare />
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path={ROUTES.POSTURE_IMAGE_LIST}
            element={
              <PrivateRoute>
                <PostureImageListWrapper />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to={ROUTES.LESSON_FORM} replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default AppRoutes;

