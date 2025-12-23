import { apiClient } from '../client';

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export const managerUsersApi = {
  getUsers: (storeId: string, params?: any): Promise<PaginatedResponse<any>> => {
    const queryString = new URLSearchParams(params).toString();
    return apiClient.get(`/api/stores/${storeId}/manager/users?${queryString}`);
  },
  getUser: (storeId: string, userId: string) =>
    apiClient.get(`/api/stores/${storeId}/manager/users/${userId}`),
  createUser: (storeId: string, userData: any) =>
    apiClient.post(`/api/stores/${storeId}/manager/users`, userData),
  updateUser: (storeId: string, userId: string, userData: any) =>
    apiClient.patch(`/api/stores/${storeId}/manager/users/${userId}`, userData),
  deleteUser: (storeId: string, userId: string) =>
    apiClient.delete(`/api/stores/${storeId}/manager/users/${userId}`),
};
