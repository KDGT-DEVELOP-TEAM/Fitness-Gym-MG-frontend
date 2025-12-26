import axiosInstance from '../axiosConfig';
import { convertPageResponse, PaginatedResponse, SpringPage } from '../../utils/pagination';
import { User } from '../../types/user';

export interface UserListParams {
  page?: number;
  size?: number;
  name?: string;
  role?: string;
  active?: boolean;
}

// export interface User {
//   id: string;
//   email: string;
//   name: string;
//   role: 'ADMIN' | 'MANAGER' | 'TRAINER';
//   createdAt: string;
// }

export const adminUsersApi = {
  getUsers: (params?: UserListParams): Promise<PaginatedResponse<User>> => {
    const queryString = new URLSearchParams(params as any).toString();
    return axiosInstance.get<SpringPage<User>>(`/api/admin/users?${queryString}`)
      .then(res => convertPageResponse(res.data));
  },

  getUser: (userId: string): Promise<User> =>
    axiosInstance.get<User>(`/api/admin/users/${userId}`).then(res => res.data),

  createUser: (userData: any): Promise<User> =>
    axiosInstance.post<User>('/api/admin/users', userData).then(res => res.data),

  updateUser: (userId: string, userData: any): Promise<User> =>
    axiosInstance.patch<User>(`/api/admin/users/${userId}`, userData).then(res => res.data),

  // 有効無効切り替えは編集モーダル内(update)でしか行わないため、コメントアウト
  // enableUser: (userId: string): Promise<User> =>
  //   axiosInstance.patch<User>(`/api/admin/users/${userId}/enable`).then(res => res.data),

  // disableUser: (userId: string): Promise<User> =>
  //   axiosInstance.patch<User>(`/api/admin/users/${userId}/disable`).then(res => res.data),

  deleteUser: (userId: string): Promise<void> =>
    axiosInstance.delete<void>(`/api/admin/users/${userId}`).then(res => res.data),
};