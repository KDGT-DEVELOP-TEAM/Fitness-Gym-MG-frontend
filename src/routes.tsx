import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MainLayout } from './components/common/MainLayout';
import { Loading } from './components/common/Loading';
import { ROUTES } from './constants/routes';
import { LoginPage } from './pages/auth/LoginPage';
import { StoreManagement } from './pages/StoreManagement'
import { CustomerSelect } from './pages/CustomerSelect';
import { LessonForm } from './pages/LessonForm';
import { LessonHistory } from './pages/LessonHistory';
import { CustomerProfile } from './pages/CustomerProfile';
import { PostureList } from './pages/PostureList';
import { PostureDetail } from './pages/PostureDetail';
import { PostureCompare } from './pages/PostureCompare';
import { CustomerManagement } from './pages/CustomerManagement';
import { CustomerList } from './pages/CustomerList';
import  UserManagement  from './pages/UserManagement';
import { UserList } from './pages/UserList';
import { HiHome } from 'react-icons/hi';

// アイコンコンポーネント
const HomeIcon = (props: { className?: string }) => {
  const Icon = HiHome as any;
  return <Icon {...props} />;
};

// ページごとのメニュー項目
const storeManagementMenuItems = [
  { path: ROUTES.STORE_MANAGEMENT, label: 'Home', icon: <HomeIcon className="w-5 h-5" /> },
];

const defaultMenuItems = [
  { path: ROUTES.STORE_MANAGEMENT, label: 'Home', icon: <HomeIcon className="w-5 h-5" /> },
];

const PrivateRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { authLoading, isAuthenticated } = useAuth();

  if (authLoading) {
    return <Loading />;
  }

  // 開発中: 認証をスキップ
  return children;
  // return isAuthenticated ? children : <Navigate to={ROUTES.LOGIN} replace />;
};

const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          <Route
            path={ROUTES.STORE_MANAGEMENT}
            element={
              <PrivateRoute>
                <MainLayout menuItems={storeManagementMenuItems}>
                  <StoreManagement />
                </MainLayout>
              </PrivateRoute>
            }
          />
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
            path={ROUTES.LESSON_HISTORY}
            element={
              <PrivateRoute>
                <MainLayout menuItems={defaultMenuItems}>
                  <LessonHistory />
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
          <Route path="/" element={<Navigate to={ROUTES.STORE_MANAGEMENT} replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default AppRoutes;

