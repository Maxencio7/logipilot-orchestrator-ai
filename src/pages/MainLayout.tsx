import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { useIsMobile } from '@/hooks/use-mobile'; // Corrected hook name

const MainLayout = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const isMobile = useIsMobile(); // Corrected hook usage

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
      <Header toggleMobileSidebar={toggleMobileSidebar} />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar for desktop: always visible */}
        <div className="hidden md:block">
          <Sidebar />
        </div>
        {/* Sidebar for mobile: slides in/out */}
        {isMobile && isMobileSidebarOpen && (
          <div className="fixed inset-0 z-40 flex md:hidden"> {/* Use flex for positioning */}
            {/* Sidebar itself */}
            {/* Added transition classes for slide-in/out effect */}
            <div
              className="relative z-50 w-64 bg-logistics-primary text-white h-full shadow-xl transition-transform duration-300 ease-in-out"
              style={{ transform: isMobileSidebarOpen ? 'translateX(0)' : 'translateX(-100%)' }}
            >
              <Sidebar toggleMobileSidebar={toggleMobileSidebar} />
            </div>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ease-in-out"
              onClick={toggleMobileSidebar}
              style={{ opacity: isMobileSidebarOpen ? 1 : 0 }}
            ></div>
          </div>
        )}
        <main className="flex-1 overflow-auto p-6"> {/* Added padding to main content */}
          <Outlet /> {/* Child routes will be rendered here */}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
