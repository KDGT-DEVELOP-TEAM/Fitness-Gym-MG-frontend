import React, { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { COLOR_CLASSES } from '../../constants/colors';

interface MenuItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

interface MainLayoutProps {
  children: ReactNode;
  menuItems: MenuItem[];
  header?: ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, menuItems, header }) => {
  return (
    <div className={`flex h-screen ${COLOR_CLASSES.BACKGROUND_LIGHT}`}>
      <Sidebar menuItems={menuItems} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {header && (
          <div className={`flex-shrink-0 ${COLOR_CLASSES.BACKGROUND_LIGHT} border-b border-black`}>
            {header}
          </div>
        )}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
};

