import axiosInstance from './axiosConfig';
import { LoginCredentials, AuthResponse } from '../types/auth';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await axiosInstance.post('/auth/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: async (): Promise<AuthResponse['user']> => {
    const response = await axiosInstance.get<AuthResponse>('/auth/me');
    return response.data.user;
  },
};

