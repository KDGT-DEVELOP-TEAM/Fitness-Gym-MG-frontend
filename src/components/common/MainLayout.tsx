import React, { ReactNode } from 'react';
import { Sidebar } from './Sidebar';

interface MenuItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

interface MainLayoutProps {
  children: ReactNode;
  menuItems: MenuItem[];
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, menuItems }) => {
  return (
    <div className="flex h-screen bg-[#FAF8F3]">
      <Sidebar menuItems={menuItems} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
};

