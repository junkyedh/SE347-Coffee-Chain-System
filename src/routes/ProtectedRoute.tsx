import { useSystemContext } from '@/hooks/useSystemContext';
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ROUTES } from '../constants';
import { jwtDecode } from 'jwt-decode';

type ProtectedRouteProps = {
  allowedRoles?: string[];
  redirectTo?: string;
  children: React.ReactNode;
};

type TokenPayload = {
  role?: string;
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  redirectTo,
  children,
}) => {
  const { isLoggedIn, role, isInitialized } = useSystemContext();
  const location = useLocation();

  const tokenLS = localStorage.getItem('token') || '';
  const roleLS = localStorage.getItem('role') || '';

  const effectiveIsLoggedIn = isLoggedIn || !!tokenLS;

  let effectiveRole = role || roleLS;
  if (!effectiveRole && tokenLS) {
    try {
      const decoded = jwtDecode<TokenPayload>(tokenLS);
      effectiveRole = decoded?.role || '';
    } catch {
      effectiveRole = '';
    }
  }

  if (!isInitialized) return null;

  const defaultRedirect =
    location.pathname.startsWith(ROUTES.ADMIN.ROOT) ||
    location.pathname.startsWith(ROUTES.MANAGER.ROOT) ||
    location.pathname.startsWith(ROUTES.STAFF.ROOT)
      ? ROUTES.ADMIN.LOGIN
      : ROUTES.LOGIN;

  const to = redirectTo ?? defaultRedirect;

  if (!effectiveIsLoggedIn) {
    return <Navigate to={to} replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    if (!effectiveRole || !allowedRoles.includes(effectiveRole)) {
      return <Navigate to={to} replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
