import { message } from 'antd';
import axios from 'axios';

// Create an instance of Axios
export const AdminApiRequest = axios.create({
  baseURL: 'https://doan2cafe-production.up.railway.app/', // Replace with your desired base URL
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'ngrok-skip-browser-warning': 'true',
  },
});

AdminApiRequest.interceptors.request.use(
  (config) => {
    const tk = localStorage.getItem('token');
    if (tk) {
      config.headers!['Authorization'] = `Bearer ${tk}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

AdminApiRequest.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle response error here
    if (error.response.status === 401) {
      window.location.href = '/login';
    }

    if (error.response.status === 403) {
      window.location.href = '/login';
    }

    if (error.response.status === 404) {
      message.error('404 Not Found');
    }

    if (error.response.status === 500) {
      message.error('500 Internal Server Error');
    }

    if (error.response.status === 503) {
      message.error('503 Service Unavailable');
    }

    if (error.response.status === 504) {
      message.error('504 Gateway Timeout');
    }

    if (error.response.status === 400) {
      message.error('400 Bad Request');
    }
    return Promise.reject(error);
  }
);
