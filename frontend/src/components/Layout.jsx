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
          <span>Projects</span>
          <span>/</span>
          <span>Software Project</span>
          <span>/</span>
          <span className="text-gray-900 font-medium tracking-tight">Active sprints</span>
        </div>
        {children}
      </main>
    </div>
  );
};

export default Layout;

