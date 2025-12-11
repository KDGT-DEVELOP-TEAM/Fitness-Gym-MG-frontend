import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MainLayout } from './components/common/MainLayout';
import { Loading } from './components/common/Loading';
import { ROUTES } from './constants/routes';
import { Login } from './pages/Login';
import { ShopManagement } from './pages/ShopManagement';
import { CustomerSelect } from './pages/CustomerSelect';
import { LessonForm } from './pages/LessonForm';
import { LessonHistory } from './pages/LessonHistory';
import { CustomerProfile } from './pages/CustomerProfile';
import { PostureList } from './pages/PostureList';
import { PostureDetail } from './pages/PostureDetail';
import { PostureCompare } from './pages/PostureCompare';
import { CustomerManagement } from './pages/CustomerManagement';
import { CustomerList } from './pages/CustomerList';
import { UserManagement } from './pages/UserManagement';
import { UserList } from './pages/UserList';
import { HiHome, HiClock } from 'react-icons/hi';

// アイコンコンポーネント
const HomeIcon = (props: { className?: string }) => {
  const Icon = HiHome as any;
  return <Icon {...props} />;
};

const ClockIcon = (props: { className?: string }) => {
  const Icon = HiClock as any;
  return <Icon {...props} />;
};

// ページごとのメニュー項目
const shopManagementMenuItems = [
  { path: ROUTES.SHOP_MANAGEMENT, label: 'Home', icon: <HomeIcon className="w-5 h-5" /> },
];

const customerSelectMenuItems = [
  { path: ROUTES.CUSTOMER_SELECT, label: 'Home', icon: <HomeIcon className="w-5 h-5" /> },
];

// lessonHistoryMenuItemsは動的に生成する必要があるため、
// Routeコンポーネント内で顧客IDを取得して使用します
const getLessonHistoryMenuItems = (customerId: string) => [
  { path: ROUTES.CUSTOMER_SELECT, label: 'Home', icon: <HomeIcon className="w-5 h-5" /> },
  {
    path: ROUTES.LESSON_HISTORY.replace(':id', customerId),
    label: '履歴',
    icon: <ClockIcon className="w-5 h-5" />,
    subItems: [
      { path: ROUTES.CUSTOMER_PROFILE.replace(':id', customerId), label: 'プロフィール' },
      { path: `/postures/${customerId}`, label: '画像一覧' },
    ],
  },
];

const defaultMenuItems = [
  { path: ROUTES.SHOP_MANAGEMENT, label: 'Home', icon: <HomeIcon className="w-5 h-5" /> },
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

// 顧客関連ページ用のラッパーコンポーネント（動的にメニューを生成）
const LessonHistoryWithMenu: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const menuItems = getLessonHistoryMenuItems(id || 'current');
  return (
    <MainLayout menuItems={menuItems}>
      <LessonHistory />
    </MainLayout>
  );
};

const CustomerProfileWithMenu: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const menuItems = getLessonHistoryMenuItems(id || 'current');
  return (
    <MainLayout menuItems={menuItems}>
      <CustomerProfile />
    </MainLayout>
  );
};

const PostureListWithMenu: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const menuItems = getLessonHistoryMenuItems(id || 'current');
  return (
    <MainLayout menuItems={menuItems}>
      <PostureList />
    </MainLayout>
  );
};

const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path={ROUTES.LOGIN} element={<Login />} />
          <Route
            path={ROUTES.SHOP_MANAGEMENT}
            element={
              <PrivateRoute>
                <MainLayout menuItems={shopManagementMenuItems}>
                  <ShopManagement />
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path={ROUTES.CUSTOMER_SELECT}
            element={
              <PrivateRoute>
                <MainLayout menuItems={customerSelectMenuItems}>
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
                <LessonHistoryWithMenu />
              </PrivateRoute>
            }
          />
          <Route
            path={ROUTES.CUSTOMER_PROFILE}
            element={
              <PrivateRoute>
                <CustomerProfileWithMenu />
              </PrivateRoute>
            }
          />
          <Route
            path={ROUTES.POSTURE_LIST}
            element={
              <PrivateRoute>
                <PostureListWithMenu />
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
          <Route path="/" element={<Navigate to={ROUTES.SHOP_MANAGEMENT} replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default AppRoutes;

