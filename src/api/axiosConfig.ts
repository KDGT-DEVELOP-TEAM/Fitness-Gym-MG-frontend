import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { storage } from '../utils/storage';
import { logger } from '../utils/logger';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// 開発環境でのデバッグ用ログ
if (import.meta.env.DEV) {
  logger.debug('APIベースURL', { baseURL: API_BASE_URL }, 'axiosConfig');
}

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
    
    // デバッグ用：トークンの確認
    if (import.meta.env.DEV) {
      logger.debug('リクエスト送信', {
        url: config.url,
        method: config.method,
        baseURL: config.baseURL,
        hasToken: !!token
      }, 'axiosConfig');
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// レスポンスインターセプター: 401エラー時に自動ログアウト
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // デバッグ用：レスポンスの確認（機密情報を含むdataは出力しない）
    if (import.meta.env.DEV) {
      logger.debug('レスポンス受信', {
        url: response.config.url,
        method: response.config.method,
        status: response.status,
        statusText: response.statusText,
        // 機密情報を含む可能性があるため、dataは出力しない
        hasData: !!response.data,
        dataType: response.data ? typeof response.data : 'null'
      }, 'axiosConfig');
    }
    return response;
  },
  (error) => {
    // デバッグ用：エラーレスポンスの確認
    if (import.meta.env.DEV) {
      logger.debug('レスポンスエラー', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        statusText: error.response?.statusText || error.message
      }, 'axiosConfig');
    }
    
    // ログインエンドポイントの401エラーは除外（ログイン失敗は正常な動作）
    const isLoginEndpoint = error.config?.url?.includes('/auth/login') && error.config?.method === 'post';
    
    if (error.response?.status === 401) {
      // ログインエンドポイント以外の401エラーのみ自動ログアウト
      if (!isLoginEndpoint) {
        logger.debug('401エラー検知、ログアウト処理を実行', undefined, 'axiosConfig');
        storage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
