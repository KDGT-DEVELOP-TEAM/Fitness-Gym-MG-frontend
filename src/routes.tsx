import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MainLayout } from './components/common/MainLayout';
import { Loading } from './components/common/Loading';
import { ROUTES } from './constants/routes';
import { Login } from './pages/Login';
import { CustomerSelect } from './pages/CustomerSelect';
import { LessonForm } from './pages/LessonForm';
import { LessonHistory } from './pages/LessonHistory';
import { CustomerProfile } from './pages/CustomerProfile';
import { PostureList } from './pages/PostureList';
import { PostureCompare } from './pages/PostureCompare';
import { CustomerManagement } from './pages/CustomerManagement';
import { CustomerList } from './pages/CustomerList';
import  UserManagement  from './pages/UserManagement';
import { UserList } from './pages/UserList';
import { HiHome, HiClock } from 'react-icons/hi';

// ページごとのメニュー項目
const customerSelectMenuItems = [
  { path: ROUTES.CUSTOMER_SELECT, label: 'Home', icon: <HiHome className="w-5 h-5" /> },
];

// lessonHistoryMenuItemsは動的に生成する必要があるため、
// Routeコンポーネント内で顧客IDを取得して使用します
const getLessonHistoryMenuItems = (customerId: string) => [
  { path: ROUTES.CUSTOMER_SELECT, label: 'Home', icon: <HiHome className="w-5 h-5" /> },
  {
    path: ROUTES.LESSON_HISTORY.replace(':id', customerId),
    label: '履歴',
    icon: <HiClock className="w-5 h-5" />,
    subItems: [
      { path: ROUTES.CUSTOMER_PROFILE.replace(':id', customerId), label: 'プロフィール' },
      { path: ROUTES.POSTURE_LIST.replace(':id', customerId), label: '画像一覧' },
    ],
  },
];

const defaultMenuItems = [
  { path: ROUTES.CUSTOMER_SELECT, label: 'Home', icon: <HiHome className="w-5 h-5" /> },
];

// ロールベース認可コンポーネント
const ProtectedRoute: React.FC<{ roles: string[] }> = ({ roles }) => {
  const { authLoading, isAuthenticated, user } = useAuth();

  if (authLoading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // ユーザーのロールが許可されたロールに含まれているかチェック
  if (user && !roles.includes(user.role)) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">アクセス拒否</h1>
          <p className="text-gray-600">このページにアクセスする権限がありません。</p>
        </div>
      </div>
    );
  }

  return <Outlet />;
};

// 顧客関連ページ用の共通レイアウトコンポーネント
const CustomerRelatedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { id } = useParams<{ id: string }>();
  const menuItems = getLessonHistoryMenuItems(id ?? 'current');

  return <MainLayout menuItems={menuItems}>{children}</MainLayout>;
};

const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path={ROUTES.LOGIN} element={<Login />} />

          {/* ADMIN, MANAGER, TRAINER がアクセス可能 */}
          <Route element={<ProtectedRoute roles={['ADMIN', 'MANAGER', 'TRAINER']} />}>
            <Route
              path={ROUTES.CUSTOMER_SELECT}
              element={
                <MainLayout menuItems={customerSelectMenuItems}>
                  <CustomerSelect />
                </MainLayout>
              }
            />
            <Route
              path={ROUTES.LESSON_FORM}
              element={
                <MainLayout menuItems={defaultMenuItems}>
                  <LessonForm />
                </MainLayout>
              }
            />
            <Route
              path={ROUTES.LESSON_HISTORY}
              element={
                <CustomerRelatedLayout>
                  <LessonHistory />
                </CustomerRelatedLayout>
              }
            />
            <Route
              path={ROUTES.CUSTOMER_PROFILE}
              element={
                <CustomerRelatedLayout>
                  <CustomerProfile />
                </CustomerRelatedLayout>
              }
            />
            <Route
              path={ROUTES.POSTURE_LIST}
              element={
                <CustomerRelatedLayout>
                  <PostureList />
                </CustomerRelatedLayout>
              }
            />
            <Route
              path={ROUTES.POSTURE_COMPARE}
              element={
                <MainLayout menuItems={defaultMenuItems}>
                  <PostureCompare />
                </MainLayout>
              }
            />
          </Route>

          {/* ADMIN のみアクセス可能 */}
          <Route element={<ProtectedRoute roles={['ADMIN']} />}>
            <Route
              path={ROUTES.USER_MANAGEMENT}
              element={
                <MainLayout menuItems={defaultMenuItems}>
                  <UserManagement />
                </MainLayout>
              }
            />
            <Route
              path={ROUTES.USER_LIST}
              element={
                <MainLayout menuItems={defaultMenuItems}>
                  <UserList />
                </MainLayout>
              }
            />
          </Route>

          {/* ADMIN, MANAGER がアクセス可能 */}
          <Route element={<ProtectedRoute roles={['ADMIN', 'MANAGER']} />}>
            <Route
              path={ROUTES.CUSTOMER_MANAGEMENT}
              element={
                <MainLayout menuItems={defaultMenuItems}>
                  <CustomerManagement />
                </MainLayout>
              }
            />
            <Route
              path={ROUTES.CUSTOMER_LIST}
              element={
                <MainLayout menuItems={defaultMenuItems}>
                  <CustomerList />
                </MainLayout>
              }
            />
          </Route>

          <Route path="/" element={<Navigate to={ROUTES.CUSTOMER_SELECT} replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default AppRoutes;

