import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { LoginPage } from '../pages/auth/LoginPage';
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { ManagerDashboard } from '../pages/manager/ManagerDashboard';
import { CustomerManagement } from '../pages/CustomerManagement';
import { UserManagement } from '../pages/UserManagement';
// import { TrainerHome } from '../pages/trainer/TrainerHome';
// 以下のコンポーネントは実際の実装に合わせてインポートしてください
// import { CustomerSelectPage } from '../pages/trainer/CustomerSelectPage';
// import { UserListPage } from '../pages/admin/UserListPage';
// import { UserDetailPage } from '../pages/admin/UserDetailPage';

// 自分が作ってないページはコメントアウトしてます
// あと、ユーザーと顧客の新規作成・詳細表示・編集・有効無効切り替え・削除はモーダル内で行うためコメントアウトしています

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route path="/trainer" element={<ProtectedRoute roles={['TRAINER']} />}>
          <Route index element={<Navigate to="/trainer/home" replace />} />
          {/* <Route path="home" element={<TrainerHome />} />
          <Route path="customers" element={<CustomerSelectPage />} /> */}
        </Route>

        <Route path="/admin" element={<ProtectedRoute roles={['ADMIN']} />}>
          <Route index element={<Navigate to="/admin/home" replace />} />
          <Route path="home" element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          {/* <Route path="users/:userId/detail" element={<UserDetailPage />} />
          <Route path="users/create" element={<UserCreatePage />} />
          <Route path="users/:userId/edit" element={<UserEditPage />} /> */}
          <Route path="customers" element={<CustomerManagement />} />
          {/* <Route path="customers/create" element={<CustomerCreatePage />} />
          <Route path="customers/:customerId/disable" element={<CustomerDisablePage />} />
          <Route path="customers/:customerId/enable" element={<CustomerEnablePage />} />
          <Route path="customers/delete" element={<CustomerDeletePage />} />
          <Route path="logs" element={<AuditLogPage />} /> */}
        </Route>

        <Route path="/manager" element={<ProtectedRoute roles={['MANAGER']} />}>
          <Route index element={<Navigate to="/manager/home" replace />} />
          <Route path="home" element={<ManagerDashboard />} />
          <Route path="users" element={<UserManagement />} />
          {/* <Route path="users/:userId/detail" element={<UserDetailPage />} />
          <Route path="users/create" element={<UserCreatePage />} />
          <Route path="users/:userId/edit" element={<UserEditPage />} /> */}
          <Route path="customers" element={<CustomerManagement />} />
          {/* <Route path="customers/create" element={<CustomerCreatePage />} />
          <Route path="customers/:customerId/disable" element={<CustomerDisablePage />} />
          <Route path="customers/:customerId/enable" element={<CustomerEnablePage />} />
          <Route path="customers/delete" element={<CustomerDeletePage />} /> */}
        </Route>

        <Route path="/customer/:customerId" element={<ProtectedRoute roles={['ADMIN', 'MANAGER', 'TRAINER']} />}>
          {/* <Route index element={<CustomerProfilePage />} />
          <Route path="edit" element={<CustomerProfileEditPage />} />
          <Route path="lesson/new" element={<LessonCreatePage />} />
          <Route path="lessons" element={<LessonHistoryPage />} />
          <Route path="vitals" element={<VitalsHistoryPage />} />
          <Route path="posture_groups" element={<PostureGroupListPage />} />
          <Route path="posture/compare" element={<PostureComparePage />} /> */}
        </Route>

        <Route path="/lesson/:lessonId" element={<ProtectedRoute roles={['ADMIN', 'MANAGER', 'TRAINER']} />}>
          {/* <Route index element={<LessonDetailPage />} />
          <Route path="edit" element={<LessonEditPage />} /> */}
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};