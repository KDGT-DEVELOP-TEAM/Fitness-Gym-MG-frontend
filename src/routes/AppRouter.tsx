import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { Login } from '../pages/auth/Login';

// Common pages (保持する画面)
import { LessonCreate } from '../pages/common/LessonCreate';
import { LessonDetail } from '../pages/common/LessonDetail';
import { PostureImageList } from '../pages/common/PostureImageList';
import { Forbidden } from '../pages/common/Forbidden';

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/403" element={<Forbidden />} />

        {/* Admin routes - 他の担当者が実装予定 */}
        <Route path="/admin" element={<ProtectedRoute roles={['ADMIN']} />}>
          <Route index element={<Navigate to="/403" replace />} />
        </Route>

        {/* Manager routes - 他の担当者が実装予定 */}
        <Route path="/manager" element={<ProtectedRoute roles={['MANAGER']} />}>
          <Route index element={<Navigate to="/403" replace />} />
        </Route>

        {/* Trainer routes - 他の担当者が実装予定 */}
        <Route path="/trainer" element={<ProtectedRoute roles={['TRAINER']} />}>
          <Route index element={<Navigate to="/403" replace />} />
        </Route>

        {/* Common routes (all roles) */}
        <Route path="/customer/:customerId" element={<ProtectedRoute roles={['ADMIN', 'MANAGER', 'TRAINER']} />}>
          <Route path="lesson/new" element={<LessonCreate />} />
          <Route path="posture_groups" element={<PostureImageList />} />
        </Route>

        <Route path="/lesson/:lessonId" element={<ProtectedRoute roles={['ADMIN', 'MANAGER', 'TRAINER']} />}>
          <Route index element={<LessonDetail />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
