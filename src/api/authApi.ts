import axiosInstance from './axiosConfig';
import { LoginCredentials, AuthResponse } from '../types/auth';
import { storage } from '../utils/storage';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>('/auth/login', credentials);
    const { token, user } = response.data;

    // JWTトークンを保存
    storage.setToken(token);

    // ユーザー情報を保存
    storage.setUser({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    return response.data;
  },

  logout: async (): Promise<void> => {
    try {
      await axiosInstance.post('/auth/logout');
    } finally {
      storage.clear();
    }
  },

  getCurrentUser: async (): Promise<AuthResponse['user']> => {
    const response = await axiosInstance.get<AuthResponse>('/auth/me');
    return response.data.user;
  },
};

