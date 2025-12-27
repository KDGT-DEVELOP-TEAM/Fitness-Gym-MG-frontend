import axiosInstance from '../axiosConfig';
import { convertPageResponse, PaginatedResponse, SpringPage } from '../../utils/pagination';

export interface UserListParams {
  page?: number;
  size?: number;
  name?: string;
  role?: string;
  active?: boolean;
}

export const adminUsersApi = {
  getUsers: (params?: UserListParams): Promise<PaginatedResponse<any>> => {
    const queryString = new URLSearchParams(params as any).toString();
    return axiosInstance.get<SpringPage<any>>(`/api/admin/users?${queryString}`)
      .then(res => convertPageResponse(res.data));
  },
  getUser: (userId: string) => 
    axiosInstance.get(`/api/admin/users/${userId}`).then(res => res.data),
  createUser: (userData: any) => 
    axiosInstance.post('/api/admin/users', userData).then(res => res.data),
  updateUser: (userId: string, userData: any) => 
    axiosInstance.patch(`/api/admin/users/${userId}`, userData).then(res => res.data),
  deleteUser: (userId: string) => 
    axiosInstance.delete(`/api/admin/users/${userId}`).then(res => res.data),
};
