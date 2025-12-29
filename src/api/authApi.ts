import axiosInstance from './axiosConfig';
import { storage } from '../utils/storage';
import { User } from '../types/user';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse extends User {
  token?: string;
}

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await axiosInstance.post<any>('/auth/login', credentials);
    const data = response.data;

    // 🔑 userId を id に詰め替える（バックエンドのキーに合わせる）
    const formattedUser: LoginResponse = {
      ...data,
      id: data.id || data.userId, // userId が来ても id として扱う
    };
    const { token, ...userData } = response.data;
    
    // JWTトークンを保存
    if (token) {
      storage.setToken(token);
    }
    
    // ユーザー情報を保存
    storage.setUser(userData);
    
    return response.data;
  },

  logout: async (): Promise<void> => {
    try {
      await axiosInstance.post('/auth/logout');
    } finally {
      storage.clear();
    }
  },

  checkAuth: async (): Promise<LoginResponse> => {
    const response = await axiosInstance.get<LoginResponse>('/auth/login');
    return response.data;
  },
};