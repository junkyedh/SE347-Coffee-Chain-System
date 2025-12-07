import { MainApiRequest } from '@/services/MainApiRequest';
import { useEffect, useState } from 'react';

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      await MainApiRequest.get('/auth/callback');
      setIsLoggedIn(true);
    } catch {
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  const refreshAuth = () => {
    checkAuth();
  };

  return { isLoggedIn, loading, refreshAuth };
};
