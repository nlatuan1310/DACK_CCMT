import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Briefcase, 
  LayoutDashboard, 
  KanbanSquare, 
  Settings, 
  ListTodo,
  Bug
} from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Board', icon: KanbanSquare, path: '/board' },
    { name: 'Backlog', icon: ListTodo, path: '/backlog' },
    { name: 'Issues', icon: Bug, path: '/issues' },
    { name: 'Project Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-200 h-screen flex flex-col fixed left-0 top-0 pt-16 z-10 transition-all duration-300">
      <div className="p-4 flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-blue-600 rounded-md flex items-center justify-center text-white font-bold text-lg">
          <Briefcase size={20} />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-gray-800">Software Project</h2>
          <p className="text-xs text-gray-500">Classic Business</p>
        </div>
      </div>
      
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            <item.icon size={18} />
            {item.name}
          </NavLink>
        ))}
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <p className="text-xs text-center text-gray-500">
          You're in a team-managed project
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
