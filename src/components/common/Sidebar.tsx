import React, { useState, useMemo } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../constants/routes';
import { HiPlus, HiPhotograph } from 'react-icons/hi';
import { COLOR_CLASSES } from '../../constants/colors';

interface MenuItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  menuItems: MenuItem[];
}

// React Icons workaround for TypeScript strict mode
const PlusIcon = HiPlus as React.ComponentType<{ className?: string }>;
const ImageIcon = HiPhotograph as React.ComponentType<{ className?: string }>;

export const Sidebar: React.FC<SidebarProps> = ({ menuItems }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { logout, actionLoading } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // 顧客IDを取得（URLクエリパラメータまたはパスから）
  const customerId = useMemo(() => {
    // クエリパラメータから取得
    const queryCustomerId = searchParams.get('customerId');
    if (queryCustomerId) return queryCustomerId;

    // URLパスから取得（例: /postures/images/:customerId）
    const imageListMatch = location.pathname.match(/\/postures\/images\/([^/]+)/);
    if (imageListMatch) return imageListMatch[1];

    return null;
  }, [location.pathname, searchParams]);

  // 顧客が選択されている場合の追加メニュー項目
  const customerMenuItems = useMemo<MenuItem[]>(() => {
    if (!customerId) return [];

    return [
      {
        path: `${ROUTES.LESSON_FORM}?customerId=${customerId}`,
        label: '新規レッスン入力',
        icon: <PlusIcon className="w-5 h-5" />,
      },
      {
        path: ROUTES.POSTURE_IMAGE_LIST.replace(':customerId', customerId),
        label: '姿勢画像一覧',
        icon: <ImageIcon className="w-5 h-5" />,
      },
    ];
  }, [customerId]);

  // メニュー項目を結合
  const allMenuItems = useMemo(() => {
    return [...menuItems, ...customerMenuItems];
  }, [menuItems, customerMenuItems]);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = async () => {
    setShowLogoutModal(false);
    await logout();
    navigate('/login');
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <aside className="w-64 bg-sidebar text-white min-h-screen flex flex-col font-poppins">
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {allMenuItems.map((item) => {
            // パスがクエリパラメータを含む場合のアクティブ判定
            const isActive = item.path.includes('?')
              ? location.pathname === item.path.split('?')[0] && location.search === `?${item.path.split('?')[1]}`
              : location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className="block rounded-20 p-0 transition-all"
                >
                  <div
                    className={`rounded-20 px-6 pt-5 pb-[0.5px] transition-colors duration-200 ${ /*ホバースタイル　*/
                      isActive
                        ? 'bg-sidebar-hover shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]'
                        : 'bg-transparent hover:bg-[rgba(122,183,122,0.4)]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon && item.icon}
                      <span className="text-lg">{item.label}</span>
                    </div>
                    <div className="bg-white h-[3px] mt-3" />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 pb-8 flex justify-center">
        <button
          onClick={handleLogoutClick}
          type="button"
          disabled={actionLoading}
          className="text-center text-lg text-white px-6 py-2 rounded-xl bg-[rgba(122,183,122,0.4)] border border-[rgba(122,183,122,0.6)] hover:bg-[rgba(122,183,122,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Log out
        </button>
      </div>

      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${COLOR_CLASSES.BACKGROUND_LIGHT} border border-[#DFDFDF] rounded-2xl p-8 max-w-md w-full mx-4 font-poppins`}>
            <h3 className="text-2xl font-medium text-gray-800 mb-4">ログアウトしますか？</h3>
            <p className="text-gray-600 mb-6">本当にログアウトしますか？</p>
            <div className="flex gap-4 justify-end">
              <button
                onClick={handleCancelLogout}
                type="button"
                className="px-6 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleConfirmLogout}
                type="button"
                disabled={actionLoading}
                className="px-6 py-2 rounded-lg bg-[#FDB7B7] text-white hover:bg-red-600 transition-colors"
              >
                {actionLoading ? '処理中...' : 'ログアウト'}
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

