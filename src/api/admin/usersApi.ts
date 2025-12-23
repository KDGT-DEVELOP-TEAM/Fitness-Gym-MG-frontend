import { apiClient } from '../client';

export interface UserListParams {
  page?: number;
  size?: number;
  name?: string;
  role?: string;
  active?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export const adminUsersApi = {
  getUsers: (params?: UserListParams): Promise<PaginatedResponse<any>> => {
    const queryString = new URLSearchParams(params as any).toString();
    return apiClient.get(`/api/admin/users?${queryString}`);
  },
  getUser: (userId: string) => apiClient.get(`/api/admin/users/${userId}`),
  createUser: (userData: any) => apiClient.post('/api/admin/users', userData),
  updateUser: (userId: string, userData: any) => 
    apiClient.patch(`/api/admin/users/${userId}`, userData),
  deleteUser: (userId: string) => apiClient.delete(`/api/admin/users/${userId}`),
};
