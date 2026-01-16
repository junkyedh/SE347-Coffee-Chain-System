import { useSystemContext } from '@/hooks/useSystemContext';
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ROUTES } from '../constants';

type ProtectedRouteProps = {
  allowedRoles?: string[];
  redirectTo?: string;
  children: React.ReactNode;
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  redirectTo,
  children,
}) => {
  const { isLoggedIn, role, isInitialized } = useSystemContext();
  const location = useLocation();

  if (!isInitialized) return null;

  const defaultRedirect =
    location.pathname.startsWith(ROUTES.ADMIN.ROOT) ||
    location.pathname.startsWith(ROUTES.MANAGER.ROOT) ||
    location.pathname.startsWith(ROUTES.STAFF.ROOT)
      ? ROUTES.ADMIN.LOGIN
      : ROUTES.LOGIN;

  const to = redirectTo ?? defaultRedirect;

  if (!isLoggedIn) {
    return <Navigate to={to} replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    if (!role || !allowedRoles.includes(role)) {
      return <Navigate to={to} replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
