import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Daybook from './pages/Daybook';
import Ledger from './pages/Ledger';
import Settings from './pages/Settings';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import { AuthProvider, useAuth } from './hooks/useAuth';

// Loading component
const LoadingScreen = () => (
  <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
      <p className="text-neutral-600">Loading...</p>
    </div>
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  console.log('🛡️ ProtectedRoute - Loading:', loading, 'User:', !!user);
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  if (!user) {
    console.log('🚫 No user, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  console.log('✅ User authenticated, showing protected content');
  return <>{children}</>;
};

const App = () => {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
};

const AppRoutes = () => {
  const { user, loading } = useAuth();
  
  console.log('🗺️ AppRoutes - Loading:', loading, 'User:', !!user, 'Email:', user?.email);

  // Show loading screen while checking authentication
  if (loading) {
    console.log('⏳ Still loading, showing loading screen');
    return <LoadingScreen />;
  }

  return (
    <Routes>
      {/* Auth routes */}
      <Route
        path="/login"
        element={
          user ? (
            <>
              {console.log('🔄 User exists (' + user.email + '), redirecting to dashboard')}
              <Navigate to="/" replace />
            </>
          ) : (
            <>
              {console.log('📝 No user, showing login page')}
              <Login />
            </>
          )
        }
      />
      <Route
        path="/register"
        element={
          user ? (
            <>
              {console.log('🔄 User exists (' + user.email + '), redirecting to dashboard')}
              <Navigate to="/" replace />
            </>
          ) : (
            <>
              {console.log('📝 No user, showing register page')}
              <Register />
            </>
          )
        }
      />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="daybook" element={<Daybook />} />
        <Route path="ledger" element={<Ledger />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;