import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { storage } from '../utils/storage';
import { logger } from '../utils/logger';

/**
 * 機密情報をマスクするヘルパー関数
 */
function maskSensitiveData(data: unknown, seen = new WeakSet()): unknown {
  if (!data || typeof data !== 'object') {
    return data;
  }

  if (seen.has(data as object)) {
    return '[Circular]';
  }
  seen.add(data as object);

  try {
    const masked = { ...(data as Record<string, unknown>) };
    const sensitiveKeys = ['token', 'password', 'pass', 'access_token', 'refresh_token', 'authorization'];

    for (const key of Object.keys(masked)) {
      const lowerKey = key.toLowerCase();
      if (sensitiveKeys.some(sk => lowerKey.includes(sk))) {
        masked[key] = '***MASKED***';
      } else if (typeof masked[key] === 'object' && masked[key] !== null) {
        masked[key] = maskSensitiveData(masked[key], seen);
      }
    }

    return masked;
  } catch (e) {
    return `[Error masking data: ${e instanceof Error ? e.message : String(e)}]`;
  }
}

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
    
    // リクエスト開始時刻を記録（レスポンス時間計算用）
    const requestStartTime = performance.now();
    (config as any).metadata = { startTime: requestStartTime };
    
    // 完全なURLを構築
    const fullUrl = config.baseURL 
      ? `${config.baseURL}${config.url}` 
      : config.url || '';
    
    // 機密情報をマスクしたヘッダー
    const maskedHeaders: Record<string, string> = {};
    if (config.headers) {
      Object.keys(config.headers).forEach(key => {
        const lowerKey = key.toLowerCase();
        if (lowerKey.includes('authorization') || lowerKey.includes('token')) {
          maskedHeaders[key] = '***MASKED***';
        } else {
          maskedHeaders[key] = String(config.headers[key]);
        }
      });
    }
    
    // 機密情報をマスクしたリクエストボディ
    let maskedBody = config.data;
    if (config.data && typeof config.data === 'object') {
      try {
        const bodyStr = JSON.stringify(config.data);
        const bodyObj = JSON.parse(bodyStr);
        maskedBody = maskSensitiveData(bodyObj);
      } catch {
        maskedBody = '[Non-serializable data]';
      }
    }
    
    // 詳細なリクエスト情報のログ出力（コンソールで展開されるように個別に出力）
    const requestLog = {
      url: fullUrl,
      method: config.method?.toUpperCase(),
      headers: maskedHeaders,
      params: config.params,
      data: maskedBody,
      timestamp: new Date().toISOString(),
    };
    console.group(`🔵 [axiosConfig] リクエスト送信: ${config.method?.toUpperCase()} ${fullUrl}`);
    console.log('URL:', fullUrl);
    console.log('Method:', config.method?.toUpperCase());
    console.log('Headers:', maskedHeaders);
    console.log('Params:', config.params);
    console.log('Data:', maskedBody);
    console.log('Timestamp:', new Date().toISOString());
    console.groupEnd();
    
    return config;
  },
  (error) => {
    logger.error('リクエスト送信エラー', error, 'axiosConfig');
    return Promise.reject(error);
  }
);

// レスポンスインターセプター: 401エラー時に自動ログアウト
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    const config = response.config as InternalAxiosRequestConfig & { metadata?: { startTime: number } };
    const requestStartTime = config.metadata?.startTime;
    const responseTime = requestStartTime ? (performance.now() - requestStartTime).toFixed(2) : 'N/A';
    
    // 完全なURLを構築
    const fullUrl = config.baseURL 
      ? `${config.baseURL}${config.url}` 
      : config.url || '';
    
    // 機密情報をマスクしたレスポンスヘッダー
    const maskedHeaders: Record<string, string> = {};
    if (response.headers) {
      Object.keys(response.headers).forEach(key => {
        const lowerKey = key.toLowerCase();
        if (lowerKey.includes('authorization') || lowerKey.includes('token')) {
          maskedHeaders[key] = '***MASKED***';
        } else {
          maskedHeaders[key] = String(response.headers[key]);
        }
      });
    }
    
    // レスポンスボディ（機密情報をマスク）
    const maskedBody = maskSensitiveData(response.data);
    
    // 詳細なレスポンス情報のログ出力（コンソールで展開されるように個別に出力）
    const statusColor = response.status >= 200 && response.status < 300 ? '🟢' : '🟡';
    console.group(`${statusColor} [axiosConfig] レスポンス受信: ${config.method?.toUpperCase()} ${fullUrl}`);
    console.log('URL:', fullUrl);
    console.log('Method:', config.method?.toUpperCase());
    console.log('Status:', response.status, response.statusText);
    console.log('Headers:', maskedHeaders);
    console.log('Data:', maskedBody);
    console.log('Response Time:', `${responseTime}ms`);
    console.log('Timestamp:', new Date().toISOString());
    console.groupEnd();
    
    return response;
  },
  (error: AxiosError) => {
    const config = error.config as (InternalAxiosRequestConfig & { metadata?: { startTime: number } }) | undefined;
    const requestStartTime = config?.metadata?.startTime;
    const responseTime = requestStartTime ? (performance.now() - requestStartTime).toFixed(2) : 'N/A';
    
    // 完全なURLを構築
    const fullUrl = config?.baseURL 
      ? `${config.baseURL}${config.url}` 
      : config?.url || 'N/A';
    
    // ログインエンドポイントの401エラーは除外（ログイン失敗は正常な動作）
    const isLoginEndpoint = config?.url?.includes('/auth/login') && config?.method === 'post';
    // 認証状態確認エンドポイントの401エラーは除外（AuthContextで処理される）
    const isAuthMeEndpoint = config?.url?.includes('/auth/me') && config?.method === 'get';
    
    // エラー情報をログ出力（コンソールで展開されるように個別に出力）
    console.group(`🔴 [axiosConfig] レスポンスエラー: ${config?.method?.toUpperCase() || 'N/A'} ${fullUrl}`);
    console.error('URL:', fullUrl);
    console.error('Method:', config?.method?.toUpperCase() || 'N/A');
    console.error('Status:', error.response?.status || 'N/A', error.response?.statusText || error.message);
    console.error('Response Data:', error.response?.data ? maskSensitiveData(error.response.data) : undefined);
    console.error('Response Time:', `${responseTime}ms`);
    console.error('Timestamp:', new Date().toISOString());
    if (error.response?.data) {
      console.error('Error Details:', maskSensitiveData(error.response.data));
    }
    console.groupEnd();
    
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
