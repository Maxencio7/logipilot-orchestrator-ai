import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar /> {/* Sidebar will now use NavLink and not need activeTab/onTabChange */}
        <main className="flex-1 overflow-auto">
          <Outlet /> {/* Child routes will be rendered here */}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
