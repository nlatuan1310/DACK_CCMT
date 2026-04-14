import React, { useState } from 'react';
import { Search, Bell, HelpCircle, Grid, ChevronDown, Settings } from 'lucide-react';
import CreateIssueModal from './CreateIssueModal';

const Header = ({ onIssueCreated }) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  return (
    <header className="h-16 bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-4">
      {/* Left section: Logo & Main Nav */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-blue-600 font-bold text-xl tracking-tight cursor-pointer">
          <Grid size={24} />
          Jira
        </div>
        <nav className="hidden md:flex items-center gap-1">
          {['Your work', 'Projects', 'Filters', 'Dashboards', 'Teams', 'Apps'].map((item) => (
            <button key={item} className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-colors">
              {item}
              <ChevronDown size={14} className="text-gray-500" />
            </button>
          ))}
          <button 
            onClick={() => setIsCreateOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md text-sm font-medium ml-2 transition-colors"
          >
            Create
          </button>
        </nav>
      </div>

      {/* Right section: Search & Profile */}
      <div className="flex items-center gap-4">
        <div className="relative hidden lg:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-64 pl-10 pr-3 py-1.5 border border-gray-300 rounded-md leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
            placeholder="Search"
          />
        </div>
        
        <div className="flex items-center gap-2 text-gray-500">
          <button className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
            <Bell size={20} />
          </button>
          <button className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
            <HelpCircle size={20} />
          </button>
          <button className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
            <Settings size={20} />
          </button>
          <button className="ml-2 w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-semibold text-sm">
            US
          </button>
        </div>
      </div>

      <CreateIssueModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={() => {
          setIsCreateOpen(false);
          if (onIssueCreated) onIssueCreated();
        }}
      />
    </header>
  );
};

export default Header;
