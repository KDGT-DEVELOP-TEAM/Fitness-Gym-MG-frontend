import axiosInstance from './axiosConfig';
import { storage } from '../utils/storage';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  userId: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'MANAGER' | 'TRAINER';
  token?: string;
}

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await axiosInstance.post<LoginResponse>('/api/auth/login', credentials);
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
      await axiosInstance.post('/api/auth/logout');
    } finally {
      storage.clear();
    }
  },

  checkAuth: async (): Promise<LoginResponse> => {
    const response = await axiosInstance.get<LoginResponse>('/api/auth/login');
    return response.data;
  },
};