import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const AppShell: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0B0F1A] relative overflow-hidden">
      {/* Hero gradient overlay */}
      <div className="fixed inset-0 bg-gradient-radial from-[#FF2D78]/10 via-[#7C4DFF]/5 to-[#2EA8FF]/5 pointer-events-none" />
      
      <div className="flex h-screen relative">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-auto p-6 xl:p-8 mx-auto w-full max-w-[1800px] 2xl:max-w-[2000px]">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AppShell;