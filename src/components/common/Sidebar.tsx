import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';

export const Sidebar: React.FC = () => {
  const location = useLocation();

  const menuItems = [
    { path: ROUTES.SHOP_MANAGEMENT, label: '店舗管理' },
    { path: ROUTES.CUSTOMER_SELECT, label: '顧客選択' },
    { path: ROUTES.LESSON_FORM, label: 'レッスン登録' },
    { path: ROUTES.LESSON_HISTORY, label: 'レッスン履歴' },
    { path: ROUTES.POSTURE_LIST, label: '姿勢一覧' },
    { path: ROUTES.CUSTOMER_MANAGEMENT, label: '顧客管理' },
    { path: ROUTES.USER_MANAGEMENT, label: 'ユーザー管理' },
  ];

  return (
    <aside className="w-64 bg-gray-800 text-white min-h-screen">
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`block px-4 py-2 rounded ${
                  location.pathname === item.path
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

