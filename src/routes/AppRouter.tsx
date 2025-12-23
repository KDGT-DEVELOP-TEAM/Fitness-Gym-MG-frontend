import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { Login } from '../pages/auth/Login';

// Admin pages
import { AdminHome } from '../pages/admin/AdminHome';
import { AdminUserList } from '../pages/admin/AdminUserList';
import { AdminUserDetail } from '../pages/admin/AdminUserDetail';
import { AdminUserCreate } from '../pages/admin/AdminUserCreate';
import { AdminUserEdit } from '../pages/admin/AdminUserEdit';
import { AdminCustomerList } from '../pages/admin/AdminCustomerList';
import { AdminCustomerCreate } from '../pages/admin/AdminCustomerCreate';
import { AdminLogs } from '../pages/admin/AdminLogs';

// Manager pages
import { ManagerHome } from '../pages/manager/ManagerHome';
import { ManagerUserList } from '../pages/manager/ManagerUserList';
import { ManagerCustomerList } from '../pages/manager/ManagerCustomerList';

// Trainer pages
import { TrainerHome } from '../pages/trainer/TrainerHome';
import { TrainerCustomerSelect } from '../pages/trainer/TrainerCustomerSelect';

// Common pages
import { CustomerProfile } from '../pages/common/CustomerProfile';
import { LessonCreate } from '../pages/common/LessonCreate';
import { LessonDetail } from '../pages/common/LessonDetail';
import { LessonHistory } from '../pages/common/LessonHistory';
import { PostureImageList } from '../pages/common/PostureImageList';
import { PostureCompare } from '../pages/common/PostureCompare';

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Admin routes */}
        <Route path="/admin" element={<ProtectedRoute roles={['ADMIN']} />}>
          <Route index element={<Navigate to="/admin/home" replace />} />
          <Route path="home" element={<AdminHome />} />
          <Route path="users" element={<AdminUserList />} />
          <Route path="users/:userId/detail" element={<AdminUserDetail />} />
          <Route path="users/create" element={<AdminUserCreate />} />
          <Route path="users/:userId/edit" element={<AdminUserEdit />} />
          <Route path="customers" element={<AdminCustomerList />} />
          <Route path="customers/create" element={<AdminCustomerCreate />} />
          <Route path="logs" element={<AdminLogs />} />
        </Route>

        {/* Manager routes */}
        <Route path="/manager" element={<ProtectedRoute roles={['MANAGER']} />}>
          <Route index element={<Navigate to="/manager/home" replace />} />
          <Route path="home" element={<ManagerHome />} />
          <Route path="users" element={<ManagerUserList />} />
          <Route path="customers" element={<ManagerCustomerList />} />
        </Route>

        {/* Trainer routes */}
        <Route path="/trainer" element={<ProtectedRoute roles={['TRAINER']} />}>
          <Route index element={<Navigate to="/trainer/home" replace />} />
          <Route path="home" element={<TrainerHome />} />
          <Route path="customers" element={<TrainerCustomerSelect />} />
        </Route>

        {/* Common routes (all roles) */}
        <Route path="/customer/:customerId" element={<ProtectedRoute roles={['ADMIN', 'MANAGER', 'TRAINER']} />}>
          <Route index element={<CustomerProfile />} />
          <Route path="lesson/new" element={<LessonCreate />} />
          <Route path="lessons" element={<LessonHistory />} />
          <Route path="posture_groups" element={<PostureImageList />} />
          <Route path="posture/compare" element={<PostureCompare />} />
        </Route>

        <Route path="/lesson/:lessonId" element={<ProtectedRoute roles={['ADMIN', 'MANAGER', 'TRAINER']} />}>
          <Route index element={<LessonDetail />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
