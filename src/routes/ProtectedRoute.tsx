import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSystemContext } from '../hooks/useSystemContext';
import { ROUTES } from '../constants';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isLoggedIn, role, isInitialized } = useSystemContext();

  if (!isInitialized) {
    return null;
  }

  if (!isLoggedIn) {
    return <Navigate to={ROUTES.LOGIN} />; // navigate to login if not logged in
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to={ROUTES.NOT_FOUND} replace />; // navigate if not authorized
  }

  return <>{children}</>;
};

export default ProtectedRoute;
