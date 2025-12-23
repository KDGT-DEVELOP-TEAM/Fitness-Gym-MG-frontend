import { apiClient } from './client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  email: string;
  name: string;
  role: 'ADMIN' | 'MANAGER' | 'TRAINER';
  storeId?: string;
}

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    return apiClient.post('/api/auth/login', credentials);
  },

  logout: async (): Promise<void> => {
    return apiClient.post('/api/auth/logout');
  },

  checkAuth: async (): Promise<LoginResponse> => {
    return apiClient.get('/api/auth/login');
  },

  resetPassword: async (email: string): Promise<void> => {
    return apiClient.post('/api/auth/reset-password', { email });
  },
};
