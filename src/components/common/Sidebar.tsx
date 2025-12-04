import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../constants/routes';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { logout } = useAuth();

  const menuItems = [
    { path: ROUTES.SHOP_MANAGEMENT, label: 'Home', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )},
  ];

  return (
    <aside className="w-64 text-white min-h-screen flex flex-col" style={{ backgroundColor: '#6B8E6B', fontFamily: 'Poppins, sans-serif' }}>
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className="block transition-all"
                  style={{
                    borderRadius: '20px',
                    padding: '0',
                  }}
                >
                  <div
                    style={{
                      borderRadius: '20px',
                      padding: '20px 24px 0.5px',
                      backgroundColor: isActive ? 'rgba(122, 183, 122, 0.4)' : 'transparent',
                      boxShadow: isActive ? 'inset 0 2px 4px rgba(0, 0, 0, 0.1)' : 'none',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'rgba(122, 183, 122, 0.4)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon && item.icon}
                      <span className="text-lg">{item.label}</span>
                    </div>
                    <div
                      className="bg-white"
                      style={{
                        height: '3px',
                        marginTop: '12px',
                        opacity: isActive ? 1 : 0.3
                      }}
                    />
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
          className="block w-full transition-all text-left"
          style={{
            borderRadius: '20px',
            padding: '0',
          }}
        >
          <div
            style={{
              borderRadius: '20px',
              padding: '20px 24px 0.5px',
              backgroundColor: 'transparent',
              transition: 'background-color 0.2s',
            }}
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
            <div
              className="bg-white"
              style={{
                height: '3px',
                marginTop: '12px',
                opacity: 0.3
              }}
            />
          </div>
        </button>
      </div>
    </aside>
  );
};

