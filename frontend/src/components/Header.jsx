import React from 'react';
import { Grid, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  
  return (
    <header className="h-16 bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-4">
      {/* Left section: Logo & Main Nav */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-indigo-600 font-bold text-xl tracking-tight cursor-pointer">
          <Grid size={24} />
          Jira
        </div>
      </div>

      {/* Right section: Profile */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-gray-500">
          <div className="flex items-center gap-3 border-l border-gray-200 pl-4 ml-2">
            <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-semibold text-sm shadow-sm" title={user?.name}>
              {user?.name?.charAt(0).toUpperCase() || 'US'}
            </div>
            <button 
              onClick={logout}
              className="p-1.5 text-gray-500 rounded-md hover:bg-red-50 hover:text-red-600 transition-colors flex items-center gap-1"
              title="Đăng xuất"
            >
              <LogOut size={18} />
              <span className="text-sm font-medium hidden md:inline">Đăng xuất</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
