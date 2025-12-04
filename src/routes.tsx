import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MainLayout } from './components/common/MainLayout';
import { Loading } from './components/common/Loading';
import { ROUTES } from './constants/routes';

// Pages
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

const PrivateRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  return isAuthenticated ? children : <Navigate to={ROUTES.LOGIN} replace />;
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
                <MainLayout>
                  <ShopManagement />
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path={ROUTES.CUSTOMER_SELECT}
            element={
              <PrivateRoute>
                <MainLayout>
                  <CustomerSelect />
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path={ROUTES.LESSON_FORM}
            element={
              <PrivateRoute>
                <MainLayout>
                  <LessonForm />
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path={ROUTES.LESSON_HISTORY}
            element={
              <PrivateRoute>
                <MainLayout>
                  <LessonHistory />
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path={ROUTES.CUSTOMER_PROFILE}
            element={
              <PrivateRoute>
                <MainLayout>
                  <CustomerProfile />
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path={ROUTES.POSTURE_LIST}
            element={
              <PrivateRoute>
                <MainLayout>
                  <PostureList />
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path={ROUTES.POSTURE_DETAIL}
            element={
              <PrivateRoute>
                <MainLayout>
                  <PostureDetail />
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path={ROUTES.POSTURE_COMPARE}
            element={
              <PrivateRoute>
                <MainLayout>
                  <PostureCompare />
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path={ROUTES.CUSTOMER_MANAGEMENT}
            element={
              <PrivateRoute>
                <MainLayout>
                  <CustomerManagement />
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path={ROUTES.CUSTOMER_LIST}
            element={
              <PrivateRoute>
                <MainLayout>
                  <CustomerList />
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path={ROUTES.USER_MANAGEMENT}
            element={
              <PrivateRoute>
                <MainLayout>
                  <UserManagement />
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route
            path={ROUTES.USER_LIST}
            element={
              <PrivateRoute>
                <MainLayout>
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

