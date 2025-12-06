import React from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  const { logout } = useAuth();

  return (
    <aside className="w-64 bg-sidebar text-white min-h-screen flex flex-col font-poppins">
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={`${item.path}-${index}`}>
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

      <div className="p-4">
        <button
          onClick={logout}
          className="block w-full rounded-20 p-0 transition-all text-left"
        >
          <div
            className="rounded-20 px-6 pt-5 pb-[0.5px] bg-transparent transition-colors duration-200"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(122, 183, 122, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="text-lg">Log out</span>
            </div>
            <div className="bg-white h-[3px] mt-3 opacity-30" />
          </div>
        </button>
      </div>
    </aside>
  );
};

