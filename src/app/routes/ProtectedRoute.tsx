import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSystemContext } from '../hooks/useSystemContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isLoggedIn, role, isInitialized } = useSystemContext();
  console.log('--- ProtectedRoute ---');
  console.log('isLoggedIn:', isLoggedIn);
  console.log('role:', role);
  console.log('isInitialized:', isInitialized);

  if (!isInitialized) {
    return null; // or a loading spinner
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" />; // navigate to login if not logged in
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />; // navigate if not authorized
  }

  return <>{children}</>;
};

export default ProtectedRoute;