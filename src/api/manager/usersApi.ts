import axiosInstance from '../axiosConfig';
import { convertPageResponse, PaginatedResponse, SpringPage } from '../../utils/pagination';

export const managerUsersApi = {
  getUsers: (storeId: string, params?: any): Promise<PaginatedResponse<any>> => {
    const queryString = new URLSearchParams(params).toString();
    return axiosInstance.get<SpringPage<any>>(`/api/stores/${storeId}/manager/users?${queryString}`)
      .then(res => convertPageResponse(res.data));
  },
  getUser: (storeId: string, userId: string) =>
    axiosInstance.get(`/api/stores/${storeId}/manager/users/${userId}`).then(res => res.data),
  createUser: (storeId: string, userData: any) =>
    axiosInstance.post(`/api/stores/${storeId}/manager/users`, userData).then(res => res.data),
  updateUser: (storeId: string, userId: string, userData: any) =>
    axiosInstance.patch(`/api/stores/${storeId}/manager/users/${userId}`, userData).then(res => res.data),
  deleteUser: (storeId: string, userId: string) =>
    axiosInstance.delete(`/api/stores/${storeId}/manager/users/${userId}`).then(res => res.data),
};
