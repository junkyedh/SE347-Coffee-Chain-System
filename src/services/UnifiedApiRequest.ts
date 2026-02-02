import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { getAccessToken } from './authStorage';
import envConfig from '@/config/env.config';

const apiClient: AxiosInstance = axios.create({
  baseURL: envConfig.apiUrl,
  timeout: envConfig.apiTimeout,
});

apiClient.interceptors.request.use(config => {
  const token = getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 for public endpoints - redirect only for truly protected resources
apiClient.interceptors.response.use(
  response => response,
  error => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    
    // If 401 on public endpoints when user not logged in, show helpful message
    if (status === 401) {
      const publicEndpoints = ['/product/', '/branch/', '/ratings/'];
      const isPublicEndpoint = publicEndpoints.some(ep => url.startsWith(ep));
      
      if (isPublicEndpoint && !getAccessToken()) {
        console.warn(
          `⚠️  Backend yêu cầu authentication cho public endpoint: ${url}\n` +
          `   Người dùng chưa đăng nhập không thể xem nội dung này.\n` +
          `   Đề xuất: Backend nên cho phép anonymous access cho endpoints public.`
        );
      }
    }
    
    return Promise.reject(error);
  }
);

export const UnifiedApiRequest = {
  get: <T = any>(url: string, config?: AxiosRequestConfig) => apiClient.get<T>(url, config),
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => apiClient.post<T>(url, data, config),
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => apiClient.put<T>(url, data, config),
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => apiClient.patch<T>(url, data, config),
  delete: <T = any>(url: string, config?: AxiosRequestConfig) => apiClient.delete<T>(url, config),
};
