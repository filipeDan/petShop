import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AppointmentPage from './pages/AppointmentPage';
import StaffViewPage from './pages/StaffViewPage';
import { Toaster } from '@/components/ui/sonner';
import { useEffect, useState } from 'react';

// Helper function to check authentication status
const getAuthStatus = () => {
  const token = localStorage.getItem('authToken');
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  return { isAuthenticated: !!token, userRole: userInfo.role || null };
};

// Protected Route Component for general users
const ProtectedRoute = () => {
  const { isAuthenticated } = getAuthStatus();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

// Protected Route Component for staff/admin
const StaffRoute = () => {
  const { isAuthenticated, userRole } = getAuthStatus();
  const isStaffOrAdmin = userRole === 'staff' || userRole === 'admin';
  return isAuthenticated && isStaffOrAdmin ? <Outlet /> : <Navigate to="/login" replace />;
};

// Component to handle logout (can be placed in a header/nav)
export const LogoutLink = ({ children }) => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    // Optionally notify backend or clear other state
    navigate('/login');
  };
  return <button onClick={handleLogout} className="text-gray-700 hover:text-blue-600 font-medium">{children || 'Sair'}</button>;
};


function App() {
  // Optional: Add state to force re-render on auth change if needed, though localStorage check on route access is often sufficient
  const [authStatus, setAuthStatus] = useState(getAuthStatus());

  // Listen for storage changes to update auth status (optional, good for multi-tab scenarios)
  useEffect(() => {
    const handleStorageChange = () => {
      setAuthStatus(getAuthStatus());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);


  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/agendar" element={<AppointmentPage />} />
          {/* Add other user-specific routes here */}
        </Route>

        {/* Staff Protected Routes */}
        <Route element={<StaffRoute />}>
          <Route path="/consultas-funcionario" element={<StaffViewPage />} />
          {/* Add other staff-specific routes here */}
        </Route>

        {/* Redirect base path */}
        <Route
          path="/"
          element={<Navigate to={authStatus.isAuthenticated ? (authStatus.userRole === 'staff' || authStatus.userRole === 'admin' ? "/consultas-funcionario" : "/agendar") : "/login"} replace />}
        />

        {/* Add a 404 or catch-all route if needed */}
        {/* <Route path="*" element={<NotFoundPage />} /> */}
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;

