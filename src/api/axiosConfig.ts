import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { storage } from '../utils/storage';
import { logger } from '../utils/logger';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Validate environment variable
if (!API_BASE_URL) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('REACT_APP_API_BASE_URL is required in production');
  }
  // Development environment: warn and use default
  logger.warn('REACT_APP_API_BASE_URL is not set, using default localhost URL', undefined, 'axiosConfig');
}

const finalApiBaseUrl = API_BASE_URL || 'http://localhost:3001/api';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: finalApiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = storage.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      storage.clear();
      // Redirect to login page on 401 Unauthorized
      // Using window.location.href for proper navigation (pathname is read-only)
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

