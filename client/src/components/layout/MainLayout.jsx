import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const MainLayout = ({ children }) => {
  return (
    <div className="bg-[#fcfbf7] text-slate-900 font-sans zellige-pattern min-h-screen">
      <Sidebar />
      <main className="ml-64 p-8 transition-all duration-300 min-h-screen">
        <Topbar />
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
