import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { storage } from '../utils/storage';
import { logger } from '../utils/logger';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// 開発環境でのデバッグ用ログ
logger.debug('APIベースURL', { baseURL: API_BASE_URL }, 'axiosConfig');

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// リクエストインターセプター: JWTトークンを自動付与
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = storage.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // デバッグ用：リクエスト情報のログ（開発環境のみ、機密情報は除外）
    logger.debug('リクエスト送信', {
      url: config.url,
      method: config.method,
    }, 'axiosConfig');
    
    return config;
  },
  (error) => Promise.reject(error)
);

// レスポンスインターセプター: 401エラー時に自動ログアウト
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // ログインエンドポイントの401エラーは除外（ログイン失敗は正常な動作）
    const isLoginEndpoint = error.config?.url?.includes('/auth/login') && error.config?.method === 'post';
    // 認証状態確認エンドポイントの401エラーは除外（AuthContextで処理される）
    const isAuthMeEndpoint = error.config?.url?.includes('/auth/me') && error.config?.method === 'get';
    
    if (error.response?.status === 401) {
      // ログインエンドポイントと認証状態確認エンドポイント以外の401エラーのみ自動ログアウト
      if (!isLoginEndpoint && !isAuthMeEndpoint) {
        logger.info('401エラー検知、ログアウト処理を実行', undefined, 'axiosConfig');
        storage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
