import axiosInstance from './axiosConfig';
import { LoginCredentials, AuthResponse } from '../types/auth';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<void> => {
    const response = await axiosInstance.post<AuthResponse>('/auth/login', credentials);
    // token保存はauthApi内で完結
    localStorage.setItem('token', response.data.token);
  },

  logout: async (): Promise<void> => {
    await axiosInstance.post('/auth/logout');
    // token削除のみ
    localStorage.removeItem('token');
  },

  getCurrentUser: async (): Promise<AuthResponse['user']> => {
    const response = await axiosInstance.get<AuthResponse>('/auth/me');
    return response.data.user;
  },
};

