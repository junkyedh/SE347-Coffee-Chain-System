import { message } from 'antd';
import axios, { AxiosError } from 'axios';
import { envConfig } from '../config/env.config';
import { ROUTES } from '../constants';
import { clearAuthStorage, getAccessToken } from './authStorage';

export const MainApiRequest = axios.create({
  baseURL: envConfig.apiUrl,
  timeout: envConfig.apiTimeout,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

let isRedirecting401 = false;
const AUTH_ERROR_KEY = 'AUTH_401_MESSAGE';

// Reset redirect flag after a delay
const resetRedirectFlag = () => {
  setTimeout(() => {
    isRedirecting401 = false;
  }, 1000);
};

const getRedirectPathForCurrentPage = () => {
  const p = window.location.pathname;
  if (
    p.startsWith(ROUTES.ADMIN.ROOT) ||
    p.startsWith(ROUTES.MANAGER.ROOT) ||
    p.startsWith(ROUTES.STAFF.ROOT)
  ) {
    return ROUTES.ADMIN.LOGIN;
  }
  return ROUTES.LOGIN;
};

const shouldSilence401 = (url?: string) => {
  const path = window.location.pathname;

  // Ignore 401 messages on auth pages
  if (
    path === ROUTES.LOGIN ||
    path === ROUTES.REGISTER ||
    path === ROUTES.FORGOT_PASSWORD ||
    path === ROUTES.ADMIN.LOGIN
  ) {
    return true;
  }

  if (!url) return false;

  // Không hiện message cho các request auth
  if (url.includes('/auth/signin') || url.includes('/auth/register')) return true;

  // Không hiện message cho các callback auth
  if (url.includes('/auth/callback')) return true;

  return false;
};

MainApiRequest.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers = config.headers ?? {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

MainApiRequest.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    const url = error.config?.url;

    if (status === 401) {

      // Show message only once and only if not on auth pages
      if (!shouldSilence401(url) && !isRedirecting401) {
        message.error({ key: AUTH_ERROR_KEY, content: 'Phiên đăng nhập hết hạn' });
      }

      // Handle redirect only once - but only if NOT on login/register pages
      if (!isRedirecting401 && !shouldSilence401(url)) {
        isRedirecting401 = true;

        clearAuthStorage();

        // Use replace to avoid adding to history
        const redirectPath = getRedirectPathForCurrentPage();
        window.location.replace(redirectPath);

        // Reset flag after redirect completes
        resetRedirectFlag();
      }

      return Promise.reject(error);
    }

    // Các status khác: chỉ hiển thị 1 message theo key để không spam
    if (status) {
      const map: Record<number, string> = {
        400: 'Yêu cầu không hợp lệ',
        403: 'Không có quyền truy cập',
        404: 'Không tìm thấy tài nguyên',
        500: 'Lỗi máy chủ nội bộ',
        503: 'Dịch vụ không khả dụng',
        504: 'Hết thời gian chờ',
      };
      message.error({ key: `HTTP_${status}`, content: map[status] ?? `Lỗi: ${status}` });
    } else if (error.request) {
      message.error({ key: 'NETWORK', content: 'Không thể kết nối đến máy chủ' });
    } else {
      message.error({ key: 'UNKNOWN', content: 'Có lỗi xảy ra' });
    }

    return Promise.reject(error);
  }
);
