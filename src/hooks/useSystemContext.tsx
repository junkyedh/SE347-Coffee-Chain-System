import React, { createContext, useContext, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { MainApiRequest } from '@/services/MainApiRequest';

interface UserInfo {
  id?: number;
  phone: string;
  name?: string;
  email?: string;
  role?: string;
  branchId?: string | number;
  type?: 'staff' | 'customer';
}

interface ContextValue {
  isLoggedIn: boolean;
  token: string;
  role: string;
  branchId?: string;
  isInitialized: boolean;
  userInfo: UserInfo | null;
  isLoadingUser: boolean;
  setAuth: (token: string, role?: string) => void;
  logout: () => void;
  refreshUserInfo: () => Promise<void>;
}

const AppContext = createContext<ContextValue | undefined>(undefined);

interface TokenPayload {
  id?: number;
  phone?: string;
  role?: string;
  branchId?: string;
  type?: 'staff' | 'customer';
  exp?: number;
  iat?: number;
}

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
  const [isLoadingUser, setIsLoadingUser] = useState(false);

  const fetchUserInfo = async (overrideToken?: string) => {
    const currentToken = overrideToken ?? localStorage.getItem('token');
    if (!currentToken) {
      setUserInfo(null);
      setIsLoadingUser(false);
      return;
    }

    setIsLoadingUser(true);
    try {
      const response = await MainApiRequest.get('/auth/callback', {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      const data = response.data?.data;
      setUserInfo(data ?? null);
    } catch (error: any) {
      console.error('Fetch user info failed:', error);
      setUserInfo(null);
      
      // Nếu token hết hạn (401) hoặc không hợp lệ, logout ngay
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        console.warn('Token expired or invalid, logging out...');
        logout();
      }
    } finally {
      setIsLoadingUser(false);
    }
  };

  const refreshUserInfo = async () => {
    await fetchUserInfo();
  };

  const setAuth = (newToken: string, newRole?: string) => {
    if (newToken) localStorage.setItem('token', newToken);

    let roleToUse = newRole ?? '';
    try {
      const decoded: TokenPayload = jwtDecode(newToken);
      if (!roleToUse && decoded?.role) roleToUse = decoded.role;
      setBranchId(decoded?.branchId);
    } catch {
      // ignore decode error
    }

    if (roleToUse) localStorage.setItem('role', roleToUse);

    setToken(newToken);
    setRole(roleToUse);
    setIsLoggedIn(!!newToken);

    // fetch user info
    fetchUserInfo(newToken);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setToken('');
    setRole('');
    setUserInfo(null);
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('sessionId');
  };

  useEffect(() => {
    const t = localStorage.getItem('token');
    const r = localStorage.getItem('role') || '';

    if (t) {
      try {
        const decoded: TokenPayload = jwtDecode(t);
        
        // Kiểm tra token có hết hạn không
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
          console.warn('Token expired, logging out...');
          logout();
          setIsInitialized(true);
          return;
        }
        
        const roleFromToken = decoded?.role ?? r;

        setToken(t);
        setRole(roleFromToken);
        setBranchId(decoded?.branchId);
        setIsLoggedIn(true);

        if (roleFromToken) localStorage.setItem('role', roleFromToken);

        fetchUserInfo(t);
      } catch (error) {
        console.error('Token decode error:', error);
        // token hỏng -> clear
        logout();
      }
    }

    setIsInitialized(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AppContext.Provider
      value={{
        isLoggedIn,
        token,
        role,
        branchId,
        setAuth,
        logout,
        isInitialized,
        userInfo,
        isLoadingUser,
        refreshUserInfo,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
