import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MainLayout } from './components/common/MainLayout';
import { Loading } from './components/common/Loading';
import { ROUTES } from './constants/routes';
import { Login } from './pages/Login';
import { CustomerSelect } from './pages/CustomerSelect';
import { LessonForm } from './pages/LessonForm';
import { LessonDetail } from './pages/LessonDetail';
import { CustomerProfile } from './pages/CustomerProfile';
import { PostureList } from './pages/PostureList';
import { PostureDetail } from './pages/PostureDetail';
import { PostureCompare } from './pages/PostureCompare';
import { PostureImageList, usePostureImageList } from './pages/PostureImageList';
import { CustomerManagement } from './pages/CustomerManagement';
import { CustomerList } from './pages/CustomerList';
import { UserManagement } from './pages/UserManagement';
import { UserList } from './pages/UserList';
import { HiHome } from 'react-icons/hi';
import { HiPhotograph } from 'react-icons/hi';

// アイコンコンポーネント
const HomeIcon = (props: { className?: string }) => {
  const Icon = HiHome as any;
  return <Icon {...props} />;
};

const ImageIcon = (props: { className?: string }) => {
  const Icon = HiPhotograph as any;
  return <Icon {...props} />;
};

// ページごとのメニュー項目（顧客未選択時）
const defaultMenuItems = [
  { path: ROUTES.CUSTOMER_SELECT, label: 'Home', icon: <HomeIcon className="w-5 h-5" /> },
];

const PrivateRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { authLoading } = useAuth();

  if (authLoading) {
    return <Loading />;
  }

  // 開発中: 認証をスキップ
  return children;
  // return isAuthenticated ? children : <Navigate to={ROUTES.LOGIN} replace />;
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
          <Route path="/lesson-form" element={<Navigate to={ROUTES.CUSTOMER_SELECT} replace />} />
          <Route
            path={ROUTES.CUSTOMER_SELECT}
            element={
              <PrivateRoute>
                <MainLayout menuItems={defaultMenuItems}>
                  <CustomerSelect />
                </MainLayout>
              </PrivateRoute>
            }
          />
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
            path={ROUTES.CUSTOMER_PROFILE}
            element={
              <PrivateRoute>
                <MainLayout menuItems={defaultMenuItems}>
                  <CustomerProfile />
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path={ROUTES.POSTURE_LIST}
            element={
              <PrivateRoute>
                <MainLayout menuItems={defaultMenuItems}>
                  <PostureList />
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path={ROUTES.POSTURE_DETAIL}
            element={
              <PrivateRoute>
                <MainLayout menuItems={defaultMenuItems}>
                  <PostureDetail />
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
          <Route
            path={ROUTES.CUSTOMER_MANAGEMENT}
            element={
              <PrivateRoute>
                <MainLayout menuItems={defaultMenuItems}>
                  <CustomerManagement />
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path={ROUTES.CUSTOMER_LIST}
            element={
              <PrivateRoute>
                <MainLayout menuItems={defaultMenuItems}>
                  <CustomerList />
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path={ROUTES.USER_MANAGEMENT}
            element={
              <PrivateRoute>
                <MainLayout menuItems={defaultMenuItems}>
                  <UserManagement />
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path={ROUTES.USER_LIST}
            element={
              <PrivateRoute>
                <MainLayout menuItems={defaultMenuItems}>
                  <UserList />
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to={ROUTES.CUSTOMER_SELECT} replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default AppRoutes;

