import React, { createContext, useContext, useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { jwtDecode } from 'jwt-decode';
import { MainApiRequest } from '@/services/MainApiRequest';
import { 
  clearAuthStorage, 
  getAccessToken, 
  getRole, 
  setAccessToken as storeAccessToken, 
  setRole as storeRole 
} from '@/services/authStorage';

interface ContextValue {
  isLoggedIn: boolean;
  token: string;
  role: string;
  branchId?: string;
  isInitialized: boolean;
  userInfo: UserInfo | null;
  setAuth: (token: string, role: string) => void;
  refreshUserInfo: () => Promise<void>;
  logout: () => void;
}

type TokenPayload = {
  id?: number;
  phone?: string;
  role?: string;
  branchId?: string;
  type?: 'staff' | 'customer';
};

export type UserInfo = {
  id?: number;
  phone?: string;
  name?: string;
  email?: string;
  gender?: string;
  address?: string;
  rank?: string;
  role?: string;
  branchId?: string;
};

const AppContext = createContext<ContextValue | undefined>(undefined);

export const useSystemContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useSystemContext must be used within AppSystemProvider');
  return ctx;
};

export const AppSystemProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [token, setToken] = useState('');
  const [role, setRole] = useState('');
  const [branchId, setBranchId] = useState<string | undefined>(undefined);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  
  // Ref to track ongoing auth requests and prevent spam
  const authRequestRef = useRef<AbortController | null>(null);
  const isRefreshingRef = useRef(false);

  const logout = useCallback(() => {
    console.log('[Auth] Logging out - clearing all auth data');
    setIsLoggedIn(false);
    setToken('');
    setRole('');
    setBranchId(undefined);
    setUserInfo(null);
    clearAuthStorage();
  }, []);

  const refreshUserInfo = useCallback(async () => {
    const t = getAccessToken();
    if (!t) {
      console.log('[Auth] refreshUserInfo: No token found, logging out');
      logout();
      return;
    }

    // Prevent concurrent refresh requests
    if (isRefreshingRef.current) {
      console.log('[Auth] Already refreshing, skipping...');
      return;
    }

    // Cancel any pending request
    if (authRequestRef.current) {
      authRequestRef.current.abort();
    }

    // Create new AbortController for this request
    authRequestRef.current = new AbortController();
    isRefreshingRef.current = true;

    console.log('[Auth] Refreshing user info...');
    
    try {
      const res = await MainApiRequest.get<{ msg: string; data: UserInfo }>('/auth/callback', {
        signal: authRequestRef.current.signal,
      });
      console.log('[Auth] User info received:', res.data.data);
      setUserInfo(res.data.data ?? null);
      setIsLoggedIn(true);
    } catch (error: any) {
      // Don't logout on abort - it's intentional
      if (error.name === 'AbortError' || error.name === 'CanceledError') {
        console.log('[Auth] Request aborted');
        return;
      }
      // token invalid / expired
      console.error('[Auth] Failed to refresh user info, logging out:', error);
      logout();
    } finally {
      isRefreshingRef.current = false;
      authRequestRef.current = null;
    }
  }, [logout]);

  const setAuth = useCallback((newToken: string, newRole: string) => {
    console.log('[Auth] setAuth called with token and role:', { tokenLength: newToken.length, role: newRole });
    
    // Store in localStorage first
    storeAccessToken(newToken);
    storeRole(newRole);
    
    // Update state
    setToken(newToken);
    setRole(newRole);
    setIsLoggedIn(true);

    try {
      const decoded: TokenPayload = jwtDecode(newToken);
      setBranchId(decoded.branchId);
    } catch {
      setBranchId(undefined);
    }

    // Fetch user info in next tick to avoid circular dependency
    setTimeout(() => {
      refreshUserInfo();
    }, 0);
  }, [refreshUserInfo]);

  useEffect(() => {
    const t = getAccessToken();
    const r = getRole();

    console.log('[Auth] Initial load - checking localStorage:', { hasToken: !!t, role: r });

    if (t && r) {
      console.log('[Auth] Restoring session from localStorage');
      setToken(t);
      setRole(r);
      setIsLoggedIn(true);

      try {
        const decoded: TokenPayload = jwtDecode(t);
        setBranchId(decoded.branchId);
        console.log('[Auth] Token decoded successfully:', { branchId: decoded.branchId, role: decoded.role });
      } catch (err) {
        console.error('[Auth] Failed to decode token:', err);
        setBranchId(undefined);
      }

      refreshUserInfo()
        .then(() => console.log('[Auth] User info refreshed successfully'))
        .catch((err) => console.error('[Auth] Failed to refresh user info:', err))
        .finally(() => {
          console.log('[Auth] Initialization complete');
          setIsInitialized(true);
        });
      return;
    }

    console.log('[Auth] No stored credentials found, user is logged out');
    setIsInitialized(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const value = useMemo(
    () => ({
      isLoggedIn,
      token,
      role,
      branchId,
      isInitialized,
      userInfo,
      setAuth,
      refreshUserInfo,
      logout,
    }),
    [isLoggedIn, token, role, branchId, isInitialized, userInfo, setAuth, refreshUserInfo, logout]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
