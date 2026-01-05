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
    const response = await axiosInstance.post<LoginResponse>('/auth/login', credentials);
    const { token, userId, email, name, role } = response.data;

    // JWTトークンを保存
    storage.setToken(token);

    // ユーザー情報を保存
    storage.setUser({
      userId,
      email,
      name,
      role,
    });

    return response.data;
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
      updatedAt: '',
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
