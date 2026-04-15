import React from 'react';
import { Outlet, Link, useMatch } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = ({ onIssueCreated }) => {
  // Lấy projectId để render breadcrumb linh hoạt
  const matchProject = useMatch('/projects/:projectId/*');
  const projectId = matchProject?.params?.projectId;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-900 flex">
      <Header onIssueCreated={onIssueCreated} />
      <Sidebar />
      
      <main className="flex-1 ml-64 pt-16 p-8 min-h-screen bg-slate-50">
        {/* Breadcrumbs */}
        <div className="mb-4 text-sm text-gray-500 flex items-center gap-2">
          <Link to="/projects" className="hover:underline hover:text-indigo-600 transition-colors">Workspace</Link>
          {projectId && (
            <>
              <span>/</span>
              <span className="text-gray-900 font-medium tracking-tight">Dự án hiện tại</span>
            </>
          )}
        </div>
        
        {/* Nội dung thay đổi ở đây */}
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
