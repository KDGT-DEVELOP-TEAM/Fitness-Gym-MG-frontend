import React, { ReactNode } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { Sidebar } from './Sidebar';

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

interface MainLayoutProps {
  children: ReactNode;
  menuItems: MenuItem[];
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, menuItems }) => {
  return (
    <div className="flex h-screen bg-[#FAF8F3]">
      <Sidebar menuItems={menuItems} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
};

