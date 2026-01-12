import { BrowserRouter, Routes, Route, Navigate, useParams, useLocation } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { Login } from '../pages/auth/Login';
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { ManagerDashboard } from '../pages/manager/ManagerDashboard';
import { CustomerManagement } from '../pages/CustomerManagement';
import { UserManagement } from '../pages/UserManagement';
import { CustomerSelect } from '../pages/CustomerSelect';
import { LessonCreate } from '../pages/common/LessonCreate';
import { LessonHistory } from '../pages/common/LessonHistory';
import { LessonDetail } from '../pages/common/LessonDetail';
import { PostureImageList } from '../pages/common/PostureImageList';
import { CustomerProfile } from '../pages/CustomerProfile';
import { MainLayout } from '../components/common/MainLayout';
import { HiHome, HiUsers, HiUserGroup, HiDocumentAdd, HiClock, HiPhotograph, HiArrowLeft, HiUser } from 'react-icons/hi';
import { ROUTES } from '../constants/routes';
import { useLessonData } from '../hooks/useLessonData';
import { useAuth } from '../context/AuthContext';
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

// ロールに応じた履歴一覧パスを取得
const getHistoryPath = (role: string, customerId: string): string => {
  switch (role.toUpperCase()) {
    case 'ADMIN':
      return ROUTES.LESSON_HISTORY_ADMIN.replace(':customerId', customerId);
    case 'MANAGER':
      return ROUTES.LESSON_HISTORY_MANAGER.replace(':customerId', customerId);
    case 'TRAINER':
    default:
      return ROUTES.LESSON_HISTORY_TRAINER.replace(':customerId', customerId);
  }
};

// ロールに応じた姿勢一覧パスを取得
const getPosturePath = (role: string, customerId: string): string => {
  switch (role.toUpperCase()) {
    case 'ADMIN':
      return ROUTES.POSTURE_LIST_ADMIN.replace(':customerId', customerId);
    case 'MANAGER':
      return ROUTES.POSTURE_LIST_MANAGER.replace(':customerId', customerId);
    case 'TRAINER':
    default:
      return ROUTES.POSTURE_LIST_TRAINER.replace(':customerId', customerId);
  }
};

// ロールに応じたHomeパスを取得
const getHomePath = (role: string): string => {
  switch (role.toUpperCase()) {
    case 'ADMIN':
      return '/admin/home';
    case 'MANAGER':
      return '/manager/home';
    case 'TRAINER':
    default:
      return '/trainer/home';
  }
};

// 顧客IDに基づいて動的にメニューアイテムを生成する関数（ロール対応版）
const getCustomerRelatedMenuItems = (customerId: string, role: string, lessonId?: string) => {
  const menuItems: any[] = [
    { 
      path: getHomePath(role), 
      label: 'Home', 
      icon: <HiArrowLeft className="w-5 h-5" />,
      isBackButton: true,
    },
    {
      path: getHistoryPath(role, customerId),
      label: '履歴一覧',
      icon: <HiClock className="w-5 h-5" />,
      subItems: lessonId ? [
        {
          path: `/lesson/${lessonId}`,
          label: 'レッスン詳細',
        },
      ] : undefined,
    },
    {
      path: getPosturePath(role, customerId),
      label: '姿勢一覧',
      icon: <HiPhotograph className="w-5 h-5" />,
    },
    {
      path: ROUTES.CUSTOMER_PROFILE.replace(':id', customerId),
      label: '顧客プロフィール',
      icon: <HiUser className="w-5 h-5" />,
    },
  ];
  
  // Adminロールの場合は「新規レッスン入力」を表示しない
  if (role.toUpperCase() !== 'ADMIN') {
    menuItems.push({
      path: `/trainer/newlessons/${customerId}`, 
      label: '新規レッスン入力', 
      icon: <HiDocumentAdd className="w-5 h-5" /> 
    });
  }
  
  return menuItems;
};

// レッスン詳細画面用のメニューアイテムを生成する関数（統一版）
const getLessonDetailMenuItems = (role: string, customerId: string, lessonId: string, from: 'home' | 'history' = 'history') => {
  const homePath = getHomePath(role);
  const historyPath = getHistoryPath(role, customerId);
  
  // レッスン詳細のパスを生成（ロールと遷移元に応じて）
  const getLessonDetailPath = (r: string, cId: string, lId: string, f: 'home' | 'history'): string => {
    const isFromHome = f === 'home';
    switch (r.toUpperCase()) {
      case 'ADMIN':
        return isFromHome 
          ? ROUTES.LESSON_DETAIL_FROM_HOME_ADMIN.replace(':customerId', cId).replace(':lessonId', lId)
          : ROUTES.LESSON_DETAIL_FROM_HISTORY_ADMIN.replace(':customerId', cId).replace(':lessonId', lId);
      case 'MANAGER':
        return isFromHome
          ? ROUTES.LESSON_DETAIL_FROM_HOME_MANAGER.replace(':customerId', cId).replace(':lessonId', lId)
          : ROUTES.LESSON_DETAIL_FROM_HISTORY_MANAGER.replace(':customerId', cId).replace(':lessonId', lId);
      case 'TRAINER':
      default:
        return isFromHome
          ? ROUTES.LESSON_DETAIL_FROM_HOME_TRAINER.replace(':customerId', cId).replace(':lessonId', lId)
          : ROUTES.LESSON_DETAIL_FROM_HISTORY_TRAINER.replace(':customerId', cId).replace(':lessonId', lId);
    }
  };
  
  const lessonDetailPath = getLessonDetailPath(role, customerId, lessonId, from);
  
  // from === 'home'の場合は、通常のHome画面と同じメニュー構造にする
  if (from === 'home') {
    const roleUpper = role.toUpperCase();
    let baseMenuItems: any[] = [];
    
    // ロールに応じた基本メニューを取得
    switch (roleUpper) {
      case 'ADMIN':
        baseMenuItems = [...adminMenuItems];
        break;
      case 'MANAGER':
        baseMenuItems = [...managerMenuItems];
        break;
      case 'TRAINER':
      default:
        baseMenuItems = [...trainerMenuItems];
        break;
    }
    
    // Homeメニューにサブメニューとして「レッスン詳細」を追加
    const menuItems = baseMenuItems.map(item => {
      if (item.path === homePath && item.label === 'Home') {
        return {
          ...item,
          subItems: [
            {
              path: lessonDetailPath,
              label: 'レッスン詳細',
            },
          ],
        };
      }
      return item;
    });
    
    return menuItems;
  }
  
  // from === 'history'の場合は、従来通りのメニュー構造
  const menuItems: any[] = [
    // 1. Home
    {
      path: homePath,
      label: 'Home',
      icon: <HiHome className="w-5 h-5" />,
    },
    
    // 2. 履歴一覧（レッスン詳細をサブメニューとして表示）
    {
      path: historyPath,
      label: '履歴一覧',
      icon: <HiClock className="w-5 h-5" />,
      subItems: [
        {
          path: lessonDetailPath,
          label: 'レッスン詳細',
        },
      ],
    },
    
    // 3. 姿勢一覧
    {
      path: getPosturePath(role, customerId),
      label: '姿勢一覧',
      icon: <HiPhotograph className="w-5 h-5" />,
    },
    
    // 4. 顧客プロフィール
    {
      path: ROUTES.CUSTOMER_PROFILE.replace(':id', customerId),
      label: '顧客プロフィール',
      icon: <HiUser className="w-5 h-5" />,
    },
  ];
  
  // 5. 新規レッスン入力（ADMIN以外、最後に追加）
  if (role.toUpperCase() !== 'ADMIN') {
    menuItems.push({
      path: `/trainer/newlessons/${customerId}`, 
      label: '新規レッスン入力', 
      icon: <HiDocumentAdd className="w-5 h-5" /> 
    });
  }
  
  return menuItems;
};

// 顧客IDを取得してメニューアイテムを生成するラッパーコンポーネント
const LessonCreateWithMenu: React.FC = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const { user } = useAuth();
  if (!customerId) {
    return <LessonCreate />;
  }
  const role = user?.role || 'TRAINER';
  const menuItems = getCustomerRelatedMenuItems(customerId, role);
  return (
    <MainLayout menuItems={menuItems}>
      <LessonCreate />
    </MainLayout>
  );
};

// レッスン履歴一覧用のラッパーコンポーネント
const LessonHistoryWithMenu: React.FC = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const { user } = useAuth();
  if (!customerId) {
    return <LessonHistory />;
  }
  const role = user?.role || 'TRAINER';
  const menuItems = getCustomerRelatedMenuItems(customerId, role);
  return (
    <MainLayout menuItems={menuItems}>
      <LessonHistory />
    </MainLayout>
  );
};

// 姿勢一覧用のラッパーコンポーネント
const PostureImageListWithMenu: React.FC = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const { user } = useAuth();
  if (!customerId) {
    return <PostureImageList />;
  }
  const role = user?.role || 'TRAINER';
  const menuItems = getCustomerRelatedMenuItems(customerId, role);
  return (
    <MainLayout menuItems={menuItems}>
      <PostureImageList />
    </MainLayout>
  );
};

// 顧客プロフィール用のラッパーコンポーネント
const CustomerProfileWithMenu: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  if (!id) {
    return <CustomerProfile />;
  }
  const role = user?.role || 'TRAINER';
  const menuItems = getCustomerRelatedMenuItems(id, role);
  return (
    <MainLayout menuItems={menuItems}>
      <CustomerProfile />
    </MainLayout>
  );
};

// レッスン詳細用のラッパーコンポーネント
const LessonDetailWithMenu: React.FC = () => {
  const { customerId, lessonId } = useParams<{ customerId: string; lessonId: string }>();
  const location = useLocation();
  const { user } = useAuth();
  const { lesson, loading } = useLessonData(lessonId);
  
  if (!lessonId) {
    return <LessonDetail />;
  }
  
  const role = user?.role || 'TRAINER';
  
  // パスから遷移元情報を判断
  // /admin/home/lesson/... なら from='home'
  // /admin/history/lesson/... なら from='history'
  let from: 'home' | 'history' = 'history'; // デフォルトは'history'
  const pathname = location.pathname;
  
  if (pathname.includes('/home/lesson/')) {
    from = 'home';
  } else if (pathname.includes('/history/lesson/')) {
    from = 'history';
  }
  
  // customerIdはパスパラメータを優先し、なければlesson.customerIdを使用
  const targetCustomerId = customerId || lesson?.customerId || '';
  
  if (!targetCustomerId) {
    // customerIdが取得できない場合はデフォルトメニュー
    return (
      <MainLayout menuItems={trainerMenuItems}>
        <LessonDetail />
      </MainLayout>
    );
  }
  
  // 統一されたメニュー生成関数を使用
  const menuItems = getLessonDetailMenuItems(role, targetCustomerId, lessonId, from);
  
  return (
    <MainLayout menuItems={menuItems}>
      <LessonDetail />
    </MainLayout>
  );
};

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/trainer" element={<ProtectedRoute roles={['TRAINER']} />}>
          <Route index element={<Navigate to="/trainer/home" replace />} />
          <Route path="home" element={<MainLayout menuItems={trainerMenuItems}><CustomerSelect /></MainLayout>} />
          <Route path="newlessons/:customerId" element={<LessonCreateWithMenu />} />
        </Route>

        {/* レッスン履歴一覧（ロールごと） */}
        <Route path={ROUTES.LESSON_HISTORY_ADMIN} element={<ProtectedRoute roles={['ADMIN']} />}>
          <Route index element={<LessonHistoryWithMenu />} />
        </Route>
        <Route path={ROUTES.LESSON_HISTORY_MANAGER} element={<ProtectedRoute roles={['MANAGER']} />}>
          <Route index element={<LessonHistoryWithMenu />} />
        </Route>
        <Route path={ROUTES.LESSON_HISTORY_TRAINER} element={<ProtectedRoute roles={['TRAINER']} />}>
          <Route index element={<LessonHistoryWithMenu />} />
        </Route>
        {/* 姿勢一覧（ロールごと） */}
        <Route path={ROUTES.POSTURE_LIST_ADMIN} element={<ProtectedRoute roles={['ADMIN']} />}>
          <Route index element={<PostureImageListWithMenu />} />
        </Route>
        <Route path={ROUTES.POSTURE_LIST_MANAGER} element={<ProtectedRoute roles={['MANAGER']} />}>
          <Route index element={<PostureImageListWithMenu />} />
        </Route>
        <Route path={ROUTES.POSTURE_LIST_TRAINER} element={<ProtectedRoute roles={['TRAINER']} />}>
          <Route index element={<PostureImageListWithMenu />} />
        </Route>
        {/* 旧パス（互換性のため残す） */}
        <Route path={ROUTES.LESSON_HISTORY} element={<ProtectedRoute roles={['ADMIN', 'MANAGER', 'TRAINER']} />}>
          <Route index element={<LessonHistoryWithMenu />} />
        </Route>
        <Route path={ROUTES.POSTURE_LIST} element={<ProtectedRoute roles={['ADMIN', 'MANAGER', 'TRAINER']} />}>
          <Route index element={<PostureImageListWithMenu />} />
        </Route>

        {/* レッスン作成画面（全ロール共通 - 旧パス互換性のため残す） */}
        <Route path={ROUTES.LESSON_FORM} element={<ProtectedRoute roles={['ADMIN', 'MANAGER', 'TRAINER']} />}>
          <Route index element={<MainLayout menuItems={trainerMenuItems}><LessonCreate /></MainLayout>} />
        </Route>

        {/* 顧客プロフィール（全ロール共通） */}
        <Route path={ROUTES.CUSTOMER_PROFILE} element={<ProtectedRoute roles={['ADMIN', 'MANAGER', 'TRAINER']} />}>
          <Route index element={<CustomerProfileWithMenu />} />
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

        {/* レッスン詳細（Homeから - ロールごと） */}
        <Route path={ROUTES.LESSON_DETAIL_FROM_HOME_ADMIN} element={<ProtectedRoute roles={['ADMIN']} />}>
          <Route index element={<LessonDetailWithMenu />} />
        </Route>
        <Route path={ROUTES.LESSON_DETAIL_FROM_HOME_MANAGER} element={<ProtectedRoute roles={['MANAGER']} />}>
          <Route index element={<LessonDetailWithMenu />} />
        </Route>
        <Route path={ROUTES.LESSON_DETAIL_FROM_HOME_TRAINER} element={<ProtectedRoute roles={['TRAINER']} />}>
          <Route index element={<LessonDetailWithMenu />} />
        </Route>
        {/* レッスン詳細（履歴一覧から - ロールごと） */}
        <Route path={ROUTES.LESSON_DETAIL_FROM_HISTORY_ADMIN} element={<ProtectedRoute roles={['ADMIN']} />}>
          <Route index element={<LessonDetailWithMenu />} />
        </Route>
        <Route path={ROUTES.LESSON_DETAIL_FROM_HISTORY_MANAGER} element={<ProtectedRoute roles={['MANAGER']} />}>
          <Route index element={<LessonDetailWithMenu />} />
        </Route>
        <Route path={ROUTES.LESSON_DETAIL_FROM_HISTORY_TRAINER} element={<ProtectedRoute roles={['TRAINER']} />}>
          <Route index element={<LessonDetailWithMenu />} />
        </Route>
        {/* 旧パス（互換性のため残す） */}
        <Route path={ROUTES.LESSON_DETAIL_ADMIN} element={<ProtectedRoute roles={['ADMIN']} />}>
          <Route index element={<LessonDetailWithMenu />} />
        </Route>
        <Route path={ROUTES.LESSON_DETAIL_MANAGER} element={<ProtectedRoute roles={['MANAGER']} />}>
          <Route index element={<LessonDetailWithMenu />} />
        </Route>
        <Route path={ROUTES.LESSON_DETAIL_TRAINER} element={<ProtectedRoute roles={['TRAINER']} />}>
          <Route index element={<LessonDetailWithMenu />} />
        </Route>
        <Route path={ROUTES.LESSON_DETAIL} element={<ProtectedRoute roles={['ADMIN', 'MANAGER', 'TRAINER']} />}>
          <Route index element={<LessonDetailWithMenu />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};