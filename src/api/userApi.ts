import { apiClient } from './client';
import { User } from '../types/user';

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export const userApi = {
  getAll: (): Promise<PaginatedResponse<User>> => apiClient.get('/api/users'),
  getById: (id: string): Promise<User> => apiClient.get(`/api/users/${id}`),
  create: (data: any): Promise<User> => apiClient.post('/api/users', data),
  update: (id: string, data: any): Promise<User> => apiClient.patch(`/api/users/${id}`, data),
  delete: (id: string): Promise<void> => apiClient.delete(`/api/users/${id}`),
};
