import { message } from 'antd';
import axios, { AxiosError } from 'axios';
import { envConfig } from '../config/env.config';
import { ROUTES } from '../constants';
import { clearAuthStorage, getAccessToken } from './authStorage';

export const AdminApiRequest = axios.create({
  baseURL: envConfig.apiUrl,
  timeout: envConfig.apiTimeout,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

let isRedirecting401 = false;
const ADMIN_AUTH_ERROR_KEY = 'ADMIN_AUTH_401';

const resetRedirectFlag = () => {
  setTimeout(() => {
    isRedirecting401 = false;
  }, 1000);
};

const shouldSilence401 = (url?: string) => {
  const path = window.location.pathname;

  if (path === ROUTES.ADMIN.LOGIN) return true;

  if (!url) return false;
  if (url.includes('/auth/signin') || url.includes('/auth/register')) return true;
  if (url.includes('/auth/callback')) return true;

  return false;
};

AdminApiRequest.interceptors.request.use(
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

AdminApiRequest.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    const url = error.config?.url;

    if (status === 401) {      
      // Show message only once
      if (!shouldSilence401(url) && !isRedirecting401) {
        message.error({ key: ADMIN_AUTH_ERROR_KEY, content: 'Phiên đăng nhập hết hạn' });
      }

      // Handle redirect only once - but only if NOT on login page
      if (!isRedirecting401 && !shouldSilence401(url)) {
        isRedirecting401 = true;
        
        clearAuthStorage();
        window.location.replace(ROUTES.ADMIN.LOGIN);
        resetRedirectFlag();
      }
      return Promise.reject(error);
    }

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
