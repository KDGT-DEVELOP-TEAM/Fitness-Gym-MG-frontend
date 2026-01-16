import axiosInstance from './axiosConfig';
import { LoginCredentials, LoginResponse } from '../types/auth';
import { User } from '../types/api/user';
import { API_ENDPOINTS } from '../constants/apiEndpoints';
import { logger } from '../utils/logger';
import { AxiosError } from 'axios';
import { ErrorResponse } from '../types/api/error';
import { transformLoginResponseToUser } from '../utils/authTransformers';

export const authApi = {
  /**
   * ログイン
   * POST /api/auth/login
   * バックエンドのLoginResponseに対応
   * 注意: ストレージ操作は呼び出し側（AuthContext）で行う
   */
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    logger.debug('ログインAPI呼び出し開始', undefined, 'authApi');
    try {
      const response = await axiosInstance.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials);
      logger.debug('ログインAPIレスポンス成功', {
        status: response.status,
      }, 'authApi');

      return response.data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      // 機密情報（headers、config.headers）は出力しない
      logger.error('ログインAPIエラー', {
        message: axiosError.message,
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        data: axiosError.response?.data,
        url: axiosError.config?.url,
        method: axiosError.config?.method,
      }, 'authApi');
      throw error;
    }
  },

  /**
   * ログアウト
   * POST /api/auth/logout
   * 注意: ストレージ操作は呼び出し側（AuthContext）で行う
   */
  logout: async (): Promise<void> => {
    await axiosInstance.post(API_ENDPOINTS.AUTH.LOGOUT);
  },

  /**
   * 認証状態の確認
   * GET /api/auth/me
   * 既に認証されている場合はユーザー情報を返す
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await axiosInstance.get<LoginResponse>(API_ENDPOINTS.AUTH.ME);
    return transformLoginResponseToUser(response.data);
  },

  /**
   * @deprecated getCurrentUserを使用してください
   */
  checkAuth: async (): Promise<LoginResponse> => {
    const response = await axiosInstance.get<LoginResponse>(API_ENDPOINTS.AUTH.ME);
    return response.data;
  },
};
