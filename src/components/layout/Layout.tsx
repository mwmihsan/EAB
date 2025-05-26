import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { useAuth } from '../../hooks/useAuth';

const Layout: React.FC = () => {
  const { loading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile viewport
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      
      // Close sidebar by default on mobile
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    // Initial check
    checkScreenSize();
    
    // Add event listener for resize
    window.addEventListener('resize', checkScreenSize);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="p-4 max-w-md w-full">
          <div className="animate-pulse flex flex-col space-y-4">
            <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
            <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
            <div className="h-32 bg-neutral-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Sidebar 
        isMobile={isMobile} 
        isOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar}
      />
      
      <div className={`transition-all duration-300 ${
        isSidebarOpen && !isMobile ? 'md:ml-64' : 'ml-0'
      }`}>
        <Header isSidebarOpen={isSidebarOpen} />
        
        <main className="pt-20 px-4 md:px-6 pb-8 min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
        
        <footer className="py-4 px-4 md:px-6 border-t border-neutral-200 text-center text-neutral-500 text-sm">
          &copy; {new Date().getFullYear()} EAB Accounting System. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default Layout;