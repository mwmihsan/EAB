import React from 'react';
import { useLocation } from 'react-router-dom';
import { 
  User,
  Bell,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface HeaderProps {
  isSidebarOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ isSidebarOpen }) => {
  const { user } = useAuth();
  const location = useLocation();
  
  // Get page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    
    if (path === '/') return 'Dashboard';
    if (path === '/daybook') return 'Daybook';
    if (path === '/ledger') return 'Ledger';
    if (path === '/settings') return 'Settings';
    
    // For nested routes
    if (path.startsWith('/daybook/')) return 'Daybook';
    if (path.startsWith('/ledger/')) return 'Ledger';
    if (path.startsWith('/settings/')) return 'Settings';
    
    return 'EAB Accounting System';
  };

  return (
    <header className={`bg-white border-b border-neutral-200 h-16 flex items-center justify-between px-4 md:px-6 fixed top-0 right-0 left-0 z-10 transition-all ${
      isSidebarOpen ? 'md:ml-64' : 'ml-0'
    }`}>
      <h1 className="text-xl font-semibold text-neutral-800">{getPageTitle()}</h1>
      
      <div className="flex items-center space-x-4">
        <button className="p-2 rounded-full hover:bg-neutral-100 text-neutral-600">
          <Bell className="h-5 w-5" />
        </button>
        
        <button className="p-2 rounded-full hover:bg-neutral-100 text-neutral-600">
          <HelpCircle className="h-5 w-5" />
        </button>
        
        <div className="relative group">
          <button className="flex items-center space-x-2 p-1 rounded-full hover:bg-neutral-100">
            <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700">
              <User className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium text-neutral-700 hidden sm:block">
              {user?.email?.split('@')[0] || 'User'}
            </span>
          </button>
          
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-dropdown border border-neutral-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
            <div className="py-2">
              <div className="px-4 py-2 border-b border-neutral-200">
                <p className="text-sm font-medium text-neutral-800">
                  {user?.email || 'User'}
                </p>
                <p className="text-xs text-neutral-500">
                  {user?.role === 'admin' ? 'Administrator' : 'Standard User'}
                </p>
              </div>
              
              <a href="#profile" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100">
                Profile Settings
              </a>
              
              <a href="#help" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100">
                Help & Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;