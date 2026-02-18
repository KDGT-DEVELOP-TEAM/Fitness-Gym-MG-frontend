import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { ConfirmModal } from './ConfirmModal';

interface SubMenuItem {
  path: string;
  label: string;
}

interface MenuItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  subItems?: SubMenuItem[];
  isBackButton?: boolean;
}

interface SidebarProps {
  menuItems: MenuItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ menuItems }) => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { logout, user } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    logout();
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <aside className="w-64 bg-sidebar text-white min-h-screen flex flex-col font-poppins">
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item, index) => {
            // パスが一致するかチェック（クエリパラメータは無視）
            const isActive = location.pathname === item.path;
            const hasSubItems = item.subItems && item.subItems.length > 0;
            // サブメニューのアクティブ状態判定（パスのみで判定、クエリパラメータは無視）
            const isSubItemActive = hasSubItems && item.subItems?.some(subItem => {
              const subItemPath = subItem.path.split('?')[0]; // クエリパラメータを除去
              const currentPath = location.pathname;
              return currentPath === subItemPath;
            });
            const isActiveOrSubActive = isActive || isSubItemActive;
            const isBackButton = item.isBackButton || false;

            // 戻るボタンでサブメニューがある場合は、サブメニュー付きのスタイルで表示
            if (isBackButton && hasSubItems) {
              return (
                <li key={item.path} className={index > 0 ? 'mt-4 pt-4 border-t border-white/20' : ''}>
                  <div
                    className={`rounded-20 px-6 pt-5 pb-[0.5px] transition-colors duration-200 ${
                      isActiveOrSubActive
                        ? 'bg-sidebar-hover shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]'
                        : 'bg-transparent hover:bg-[rgba(122,183,122,0.4)]'
                    }`}
                  >
                    <Link
                      to={item.path}
                      className="block pb-2"
                    >
                      <div className="flex items-center gap-3">
                        {item.icon && item.icon}
                        <span className="text-lg">{item.label}</span>
                      </div>
                    </Link>
                    <ul className="px-6 pt-2 pb-2 space-y-1">
                      {item.subItems?.map((subItem) => {
                        const isSubActive = location.pathname === subItem.path.split('?')[0];
                        return (
                          <li key={subItem.path}>
                            <Link
                              to={subItem.path}
                              className={`block py-1 px-3 rounded-lg text-base transition-all ${
                                isSubActive
                                  ? 'text-white font-medium bg-[rgba(255,255,255,0.15)]'
                                  : 'text-white/90 hover:text-white hover:bg-[rgba(255,255,255,0.1)]'
                              }`}
                            >
                              {subItem.label}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                    <div className="bg-white h-[3px] mt-1" />
                  </div>
                </li>
              );
            }
            
            // 戻るボタンでサブメニューがない場合は、通常の戻るボタンスタイルで表示
            if (isBackButton && !hasSubItems) {
              return (
                <li key={item.path} className={index > 0 ? 'mt-4 pt-4 border-t border-white/20' : ''}>
                  <Link
                    to={item.path}
                    className="block rounded-20 p-0 transition-all"
                  >
                    <div
                      className={`rounded-20 px-6 pt-5 pb-[0.5px] transition-colors duration-200 ${
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
            }

            return (
              <li key={item.path}>
                {hasSubItems ? (
                  <>
                    <div
                      className={`rounded-20 px-6 pt-5 pb-[0.5px] transition-colors duration-200 ${
                        isActiveOrSubActive
                          ? 'bg-sidebar-hover shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]'
                          : 'bg-transparent hover:bg-[rgba(122,183,122,0.4)]'
                      }`}
                    >
                      <Link
                        to={item.path}
                        className="block pb-2"
                      >
                        <div className="flex items-center gap-3">
                          {item.icon && item.icon}
                          <span className="text-lg">{item.label}</span>
                        </div>
                      </Link>
                      <ul className="px-6 pt-2 pb-2 space-y-1">
                        {item.subItems?.map((subItem) => {
                          const isSubActive = location.pathname === subItem.path;
                          return (
                            <li key={subItem.path}>
                              <Link
                                to={subItem.path}
                                className={`block py-1 px-3 rounded-lg text-base transition-all ${
                                  isSubActive
                                    ? 'text-white font-medium bg-[rgba(255,255,255,0.15)]'
                                    : 'text-white/90 hover:text-white hover:bg-[rgba(255,255,255,0.1)]'
                                }`}
                              >
                                {subItem.label}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                      <div className="bg-white h-[3px] mt-1" />
                    </div>
                  </>
                ) : (
                  <Link
                    to={item.path}
                    className="block rounded-20 p-0 transition-all"
                  >
                    <div
                      className={`rounded-20 px-6 pt-5 pb-[0.5px] transition-colors duration-200 ${
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
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {user && (
        <div className="px-4 py-4 border-t border-white/20">
          <div className="bg-[rgba(255,255,255,0.1)] rounded-lg p-4">
            <div className="text-white">
              <div className="text-lg font-medium mb-1">{user.name}</div>
              <div className="text-sm text-white/80">{user.email}</div>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 pb-8 flex justify-center">
        <button
          onClick={handleLogoutClick}
          className="text-center text-lg text-white px-6 py-2 rounded-xl bg-[rgba(122,183,122,0.4)] border border-[rgba(122,183,122,0.6)] hover:bg-[rgba(122,183,122,0.5)] transition-all"
        >
          ログアウト
        </button>
      </div>

      <ConfirmModal
        isOpen={showLogoutModal}
        title="ログアウトしますか？"
        message="本当にログアウトしますか？"
        confirmText="ログアウト"
        cancelText="キャンセル"
        onConfirm={handleConfirmLogout}
        onCancel={handleCancelLogout}
        isLoading={false}
      />
    </aside>
  );
};

