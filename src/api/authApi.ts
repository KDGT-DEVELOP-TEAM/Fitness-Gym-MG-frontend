import axiosInstance from './axiosConfig';
import { LoginCredentials, LoginResponse } from '../types/auth';
import { User } from '../types/api/user';
import { storage } from '../utils/storage';
import { API_ENDPOINTS } from '../constants/apiEndpoints';
import { logger } from '../utils/logger';
import { AxiosError } from 'axios';
import { ErrorResponse } from '../types/api/error';

export const authApi = {
  /**
   * ログイン
   * POST /api/auth/login
   * バックエンドのLoginResponseに対応
   */
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    logger.debug('ログインAPI呼び出し開始', undefined, 'authApi');
    try {
      const response = await axiosInstance.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials);
      logger.debug('ログインAPIレスポンス成功', {
        status: response.status,
      }, 'authApi');
      const { token, userId, email, name, role } = response.data;

      // JWTトークンを保存
      // 注意: API層でのストレージ操作は責務の分離の観点から将来的に改善の余地あり
      logger.debug('トークン保存開始', undefined, 'authApi');
      storage.setToken(token);
      logger.debug('トークン保存完了', undefined, 'authApi');

      // ユーザー情報を保存
      // 注意: API層でのストレージ操作は責務の分離の観点から将来的に改善の余地あり
      logger.debug('ユーザー情報保存開始', undefined, 'authApi');
      storage.setUser({
        userId,
        email,
        name,
        role,
      });
      logger.debug('ユーザー情報保存完了', undefined, 'authApi');

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
   */
  logout: async (): Promise<void> => {
    try {
      await axiosInstance.post(API_ENDPOINTS.AUTH.LOGOUT);
    } finally {
      storage.clear();
    }
  },

  /**
   * 認証状態の確認
   * GET /api/auth/me
   * 既に認証されている場合はユーザー情報を返す
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await axiosInstance.get<LoginResponse>(API_ENDPOINTS.AUTH.ME);
    const { userId, email, name, role, storeIds } = response.data;
    
    // LoginResponseをUser型に変換
    // バックエンドのLoginResponseには一部のフィールドがないため、最小限の情報のみ
    return {
      id: userId,
      email,
      name,
      kana: '', // LoginResponseにはkanaが含まれていないため空文字
      role,
      storeIds: storeIds || [], // LoginResponseからstoreIdsを取得、ない場合は空配列
      active: true, // LoginResponseにはactiveが含まれていないためtrueと仮定
      createdAt: '',
    };
  },

  /**
   * @deprecated getCurrentUserを使用してください
   */
  checkAuth: async (): Promise<LoginResponse> => {
    const response = await axiosInstance.get<LoginResponse>(API_ENDPOINTS.AUTH.ME);
    return response.data;
  },
};
