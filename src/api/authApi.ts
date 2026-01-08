import axiosInstance from './axiosConfig';
import { LoginCredentials, LoginResponse } from '../types/auth';
import { User } from '../types/api/user';
import { storage } from '../utils/storage';

export const authApi = {
  /**
   * ログイン
   * POST /api/auth/login
   * バックエンドのLoginResponseに対応
   */
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    console.log('[authApi] ログインAPI呼び出し開始');
    try {
      const response = await axiosInstance.post<LoginResponse>('/auth/login', credentials);
      console.log('[authApi] ログインAPIレスポンス成功:', {
        status: response.status,
        data: response.data,
        headers: response.headers
      });
      const { token, userId, email, name, role } = response.data;

    // JWTトークンを保存
    console.log('[authApi] トークン保存開始');
    storage.setToken(token);
    console.log('[authApi] トークン保存完了');

    // ユーザー情報を保存
    console.log('[authApi] ユーザー情報保存開始');
    storage.setUser({
      userId,
      email,
      name,
      role,
    });
    console.log('[authApi] ユーザー情報保存完了');

      return response.data;
    } catch (error: any) {
      console.error('[authApi] ログインAPIエラー:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      });
      throw error;
    }
  },

  /**
   * ログアウト
   * POST /api/auth/logout
   */
  logout: async (): Promise<void> => {
    try {
      await axiosInstance.post('/auth/logout');
    } finally {
      storage.clear();
    }
  },

  /**
   * 認証状態の確認
   * GET /api/auth/login
   * 既に認証されている場合はユーザー情報を返す
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await axiosInstance.get<LoginResponse>('/auth/login');
    const { userId, email, name, role } = response.data;
    
    // LoginResponseをUser型に変換
    // バックエンドのLoginResponseには一部のフィールドがないため、最小限の情報のみ
    return {
      id: userId,
      email,
      name,
      kana: '', // LoginResponseにはkanaが含まれていないため空文字
      role,
      storeIds: [], // LoginResponseにはstoreIdsが含まれていないため空配列
      active: true, // LoginResponseにはactiveが含まれていないためtrueと仮定
      createdAt: '',
    };
  },

  /**
   * @deprecated getCurrentUserを使用してください
   */
  checkAuth: async (): Promise<LoginResponse> => {
    const response = await axiosInstance.get<LoginResponse>('/auth/login');
    return response.data;
  },
};
