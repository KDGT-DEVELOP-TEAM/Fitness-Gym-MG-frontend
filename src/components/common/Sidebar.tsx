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

      <div className="p-4 pb-8">
        <button
          onClick={logout}
          className="w-full text-center text-lg text-white hover:opacity-60 transition-opacity"
        >
          Log out
        </button>
      </div>
    </aside>
  );
};

