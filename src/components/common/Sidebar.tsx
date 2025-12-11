import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface MenuItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  menuItems: MenuItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ menuItems }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, actionLoading } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

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
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
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
          <div className="bg-[#FAF8F3] border border-[#DFDFDF] rounded-2xl p-8 max-w-md w-full mx-4 font-poppins">
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

