import { message } from 'antd';
import axios from 'axios';
import { envConfig } from '../config/env.config';

export const MainApiRequest = axios.create({
  baseURL: envConfig.apiUrl,
  timeout: envConfig.apiTimeout,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'ngrok-skip-browser-warning': 'true',
  },
});

MainApiRequest.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

MainApiRequest.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status } = error.response;

      switch (status) {
        case 400:
          message.error('Yêu cầu không hợp lệ');
          break;
        case 401:
          message.error('Phiên đăng nhập hết hạn');
          // Có thể chuyển hướng đến trang login nếu cần
          // window.location.href = '/dang-nhap';
          break;
        case 403:
          message.error('Không có quyền truy cập');
          break;
        case 404:
          message.error('Không tìm thấy tài nguyên');
          break;
        case 500:
          message.error('Lỗi máy chủ nội bộ');
          break;
        case 503:
          message.error('Dịch vụ không khả dụng');
          break;
        case 504:
          message.error('Hết thời gian chờ');
          break;
        default:
          message.error(`Lỗi: ${status}`);
      }
    } else if (error.request) {
      message.error('Không thể kết nối đến máy chủ');
    } else {
      message.error('Có lỗi xảy ra');
    }

    console.error('Response Error:', error);
    return Promise.reject(error);
  }
);
