import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { Login } from '../pages/auth/Login';
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { ManagerDashboard } from '../pages/manager/ManagerDashboard';
import { CustomerManagement } from '../pages/CustomerManagement';
import { UserManagement } from '../pages/UserManagement';
import { CustomerSelect } from '../pages/CustomerSelect';
import { MainLayout } from '../components/common/MainLayout';
import { HiHome, HiUsers, HiUserGroup } from 'react-icons/hi';
// 以下のコンポーネントは実際の実装に合わせてインポートしてください
// import { CustomerSelectPage } from '../pages/trainer/CustomerSelectPage';
// import { UserListPage } from '../pages/admin/UserListPage';
// import { UserDetailPage } from '../pages/admin/UserDetailPage';

// 自分が作ってないページはコメントアウトしてます
// あと、ユーザーと顧客の新規作成・詳細表示・編集・有効無効切り替え・削除はモーダル内で行うためコメントアウトしています

// メニュー項目の定義
const trainerMenuItems = [
  { path: '/trainer/home', label: 'Home', icon: <HiHome className="w-5 h-5" /> },
];

const adminMenuItems = [
  { path: '/admin/home', label: 'Home', icon: <HiHome className="w-5 h-5" /> },
  { path: '/admin/users', label: 'ユーザー管理', icon: <HiUsers className="w-5 h-5" /> },
  { path: '/admin/customers', label: '顧客管理', icon: <HiUserGroup className="w-5 h-5" /> },
];

const managerMenuItems = [
  { path: '/manager/home', label: 'Home', icon: <HiHome className="w-5 h-5" /> },
  { path: '/manager/users', label: 'ユーザー管理', icon: <HiUsers className="w-5 h-5" /> },
  { path: '/manager/customers', label: '顧客管理', icon: <HiUserGroup className="w-5 h-5" /> },
];

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/trainer" element={<ProtectedRoute roles={['TRAINER']} />}>
          <Route index element={<Navigate to="/trainer/home" replace />} />
          <Route path="home" element={<MainLayout menuItems={trainerMenuItems}><CustomerSelect /></MainLayout>} />
        </Route>

        <Route path="/admin" element={<ProtectedRoute roles={['ADMIN']} />}>
          <Route index element={<Navigate to="/admin/home" replace />} />
          <Route path="home" element={<MainLayout menuItems={adminMenuItems}><AdminDashboard /></MainLayout>} />
          <Route path="users" element={<MainLayout menuItems={adminMenuItems}><UserManagement /></MainLayout>} />
          {/* <Route path="users/:userId/detail" element={<UserDetailPage />} />
          <Route path="users/create" element={<UserCreatePage />} />
          <Route path="users/:userId/edit" element={<UserEditPage />} /> */}
          <Route path="customers" element={<MainLayout menuItems={adminMenuItems}><CustomerManagement /></MainLayout>} />
          {/* <Route path="customers/create" element={<CustomerCreatePage />} />
          <Route path="customers/:customerId/disable" element={<CustomerDisablePage />} />
          <Route path="customers/:customerId/enable" element={<CustomerEnablePage />} />
          <Route path="customers/delete" element={<CustomerDeletePage />} />
          <Route path="logs" element={<AuditLogPage />} /> */}
        </Route>

        <Route path="/manager" element={<ProtectedRoute roles={['MANAGER']} />}>
          <Route index element={<Navigate to="/manager/home" replace />} />
          <Route path="home" element={<MainLayout menuItems={managerMenuItems}><ManagerDashboard /></MainLayout>} />
          <Route path="users" element={<MainLayout menuItems={managerMenuItems}><UserManagement /></MainLayout>} />
          {/* <Route path="users/:userId/detail" element={<UserDetailPage />} />
          <Route path="users/create" element={<UserCreatePage />} />
          <Route path="users/:userId/edit" element={<UserEditPage />} /> */}
          <Route path="customers" element={<MainLayout menuItems={managerMenuItems}><CustomerManagement /></MainLayout>} />
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