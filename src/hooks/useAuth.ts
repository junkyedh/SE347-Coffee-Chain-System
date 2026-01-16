import { useSystemContext } from "./useSystemContext";

export const useAuth = () => {
  const { isLoggedIn, isInitialized, refreshUserInfo } = useSystemContext();

  return {
    isLoggedIn,
    loading: !isInitialized,
    refreshAuth: refreshUserInfo,
  };
};
