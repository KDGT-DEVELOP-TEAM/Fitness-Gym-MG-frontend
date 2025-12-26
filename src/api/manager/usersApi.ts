import axiosInstance from '../axiosConfig';
import { convertPageResponse, PaginatedResponse, SpringPage } from '../../utils/pagination';
import { User } from '../../types/user';

// export interface User {
//   id: string;
//   email: string;
//   name: string;
//   role: 'ADMIN' | 'MANAGER' | 'TRAINER';
//   createdAt: string;
// }

export interface UserListParams {
  page?: number;
  size?: number;
  name?: string;
  role?: string;
  active?: boolean;
}

export const managerUsersApi = {
  getUsers: (storeId: string, params?: UserListParams): Promise<PaginatedResponse<User>> => {
    const queryString = new URLSearchParams(params as any).toString();
    return axiosInstance.get<SpringPage<User>>(`/api/stores/${storeId}/manager/users?${queryString}`)
      .then(res => convertPageResponse(res.data));
  },

  getUser: (storeId: string, userId: string): Promise<User> =>
    axiosInstance.get<User>(`/api/stores/${storeId}/manager/users/${userId}`).then(res => res.data),

  createUser: (storeId: string, userData: any): Promise<User> =>
    axiosInstance.post<User>(`/api/stores/${storeId}/manager/users`, userData).then(res => res.data),

  updateUser: (storeId: string, userId: string, userData: any): Promise<User> =>
    axiosInstance.patch<User>(`/api/stores/${storeId}/manager/users/${userId}`, userData).then(res => res.data),

  // 有効無効切り替えは編集モーダル内(update)でしか行わないため、コメントアウト
  // enableUser: (storeId: string, userId: string): Promise<User> =>
  //   axiosInstance.patch<User>(`/api/stores/${storeId}/manager/users/${userId}/enable`).then(res => res.data),

  // disableUser: (storeId: string, userId: string): Promise<User> =>
  //   axiosInstance.patch<User>(`/api/stores/${storeId}/manager/users/${userId}/disable`).then(res => res.data),

  deleteUser: (storeId: string, userId: string): Promise<void> =>
    axiosInstance.delete<void>(`/api/stores/${storeId}/manager/users/${userId}`).then(res => res.data),
};