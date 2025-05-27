import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  BookText, 
  Settings, 
  ChevronRight, 
  LogOut, 
  Menu, 
  X
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface SidebarProps {
  isMobile: boolean;
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isMobile, isOpen, toggleSidebar }) => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => {
    if (!isMobile) {
      setIsCollapsed(!isCollapsed);
    }
  };

  // Close sidebar on mobile when navigating
  const handleNavigation = () => {
    if (isMobile) {
      toggleSidebar();
    }
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) => {
    return `flex items-center p-3 rounded-lg transition-colors ${
      isActive 
        ? 'bg-primary-100 text-primary-800 font-medium' 
        : 'text-neutral-600 hover:bg-neutral-100'
    }`;
  };

  const sidebarClass = `
    fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-neutral-200 shadow-lg
    transform transition-transform duration-300 ease-in-out
    ${isMobile ? (isOpen ? 'translate-x-0' : '-translate-x-full') : ''}
    ${!isMobile && isCollapsed ? 'w-20' : 'w-64'}
  `;

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-neutral-900 bg-opacity-50 z-20"
          onClick={toggleSidebar}
        />
      )}

      <aside className={sidebarClass}>
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="flex items-center justify-between p-4 border-b border-neutral-200">
            {!isCollapsed && (
              <div className="flex items-center space-x-2">
                <BookText className="h-6 w-6 text-primary-600" />
                <h1 className="text-lg font-bold text-primary-800">EAB Accounting</h1>
              </div>
            )}
            
            {isMobile ? (
              <button onClick={toggleSidebar} className="p-1 rounded-md hover:bg-neutral-100">
                <X className="h-6 w-6 text-neutral-500" />
              </button>
            ) : (
              <button onClick={toggleCollapse} className="p-1 rounded-md hover:bg-neutral-100">
                <ChevronRight className={`h-5 w-5 text-neutral-500 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>

          {/* Navigation - All items visible to all users */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <NavLink to="/" className={navLinkClass} onClick={handleNavigation}>
              <LayoutDashboard className="h-5 w-5 mr-3" />
              {!isCollapsed && <span>Dashboard</span>}
            </NavLink>
            
            <NavLink to="/daybook" className={navLinkClass} onClick={handleNavigation}>
              <BookOpen className="h-5 w-5 mr-3" />
              {!isCollapsed && <span>Daybook</span>}
            </NavLink>
            
            <NavLink to="/ledger" className={navLinkClass} onClick={handleNavigation}>
              <BookText className="h-5 w-5 mr-3" />
              {!isCollapsed && <span>Ledger</span>}
            </NavLink>
            
            <NavLink to="/settings" className={navLinkClass} onClick={handleNavigation}>
              <Settings className="h-5 w-5 mr-3" />
              {!isCollapsed && <span>Settings</span>}
            </NavLink>
          </nav>

          {/* User info and logout */}
          <div className="p-4 border-t border-neutral-200">
            {!isCollapsed && user && (
              <div className="mb-2 text-sm text-neutral-500">
                Logged in as: <span className="font-medium">{user.email}</span>
              </div>
            )}
            
            <button 
              onClick={signOut} 
              className="flex items-center w-full p-2 rounded-md text-neutral-700 hover:bg-neutral-100"
            >
              <LogOut className="h-5 w-5 mr-3" />
              {!isCollapsed && <span>Sign Out</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile toggle button */}
      {isMobile && !isOpen && (
        <button 
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-10 p-2 rounded-md bg-white shadow-md"
        >
          <Menu className="h-6 w-6 text-neutral-700" />
        </button>
      )}
    </>
  );
};

export default Sidebar;