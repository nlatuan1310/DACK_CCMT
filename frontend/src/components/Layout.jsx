import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = ({ children, onIssueCreated }) => {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <Header onIssueCreated={onIssueCreated} />
      <Sidebar />
      <main className="ml-64 pt-16 p-8 min-h-screen bg-white">
        {/* Breadcrumbs can go here or inside pages */}
        <div className="mb-4 text-sm text-gray-500 flex items-center gap-2">
          <span>Hệ thống</span>
          <span>/</span>
          <span>Workspace</span>
          <span>/</span>
          <span className="text-gray-900 font-medium tracking-tight">Bảng tổng hợp gốc</span>
        </div>
        {children}
      </main>
    </div>
  );
};

export default Layout;

