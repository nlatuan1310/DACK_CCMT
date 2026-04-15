import React from 'react';
import { NavLink, useMatch } from 'react-router-dom';
import { 
  Briefcase, 
  KanbanSquare, 
  Settings as SettingsIcon, 
  LayoutDashboard
} from 'lucide-react';

const Sidebar = () => {
  // Kiểm tra xem chúng ta có đang ở trong một project hay không
  const matchProject = useMatch('/projects/:projectId/*');
  const projectId = matchProject?.params?.projectId;

  let navItems = [];
  if (projectId) {
    navItems = [
      { name: 'Kanban Board', icon: KanbanSquare, path: `/projects/${projectId}/board` },
      { name: 'Cài đặt Dự án', icon: SettingsIcon, path: `/projects/${projectId}/settings` },
    ];
  }

  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-200 h-screen flex flex-col fixed left-0 top-0 pt-16 z-10 transition-all duration-300">
      <div className="p-4 flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-indigo-600 rounded-md flex items-center justify-center text-white font-bold text-lg shadow-sm">
          <Briefcase size={20} />
        </div>
        <div className="overflow-hidden">
          <h2 className="text-sm font-semibold text-gray-800 truncate">
            {projectId ? 'Workspace Dự Án' : 'Global Workspace'}
          </h2>
          <p className="text-xs text-gray-500 truncate">Quản lý hiệu quả</p>
        </div>
      </div>
      
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        <NavLink
            to="/projects"
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive && !projectId
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            <LayoutDashboard size={18} />
            Tất cả dự án
        </NavLink>

        {navItems.length > 0 && <div className="pt-4 pb-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Luồng dự án</div>}

        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            <item.icon size={18} />
            {item.name}
          </NavLink>
        ))}
      </nav>
      
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <p className="text-[11px] text-center text-gray-400 leading-tight">
          Hệ thống theo chuẩn Jira<br />Mô hình Epic - Story - Task
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
