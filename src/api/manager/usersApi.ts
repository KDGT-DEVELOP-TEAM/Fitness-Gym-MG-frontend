import axiosInstance from '../axiosConfig';
import { convertPageResponse, PaginatedResponse, SpringPage } from '../../utils/pagination';
import { User, UserRequest, UserListParams } from '../../types/api/user';

export const managerUsersApi = {
  getUsers: (storeId: string, params?: UserListParams): Promise<PaginatedResponse<User>> => {
    const queryString = new URLSearchParams(params as Record<string, string>).toString();
    return axiosInstance.get<SpringPage<User>>(`/stores/${storeId}/manager/users?${queryString}`)
      .then(res => convertPageResponse(res.data));
  },

  getUser: (storeId: string, userId: string): Promise<User> =>
    axiosInstance.get<User>(`/stores/${storeId}/manager/users/${userId}`).then(res => res.data),

  // createUser: (storeId: string, userData: UserFormData): Promise<User> =>
  //   axiosInstance.post<User>(`/stores/${storeId}/manager/users`, userData).then(res => res.data),
  createUser: (storeId: string, userData: UserRequest): Promise<void> => {
    return axiosInstance.post<void>(`/stores/${storeId}/manager/users`, userData).then(() => undefined);
  },

  // updateUser: (storeId: string, userId: string, userData: UserFormData): Promise<User> =>
  //   axiosInstance.patch<User>(`/stores/${storeId}/manager/users/${userId}`, userData).then(res => res.data),
  updateUser: (storeId: string, userId: string, userData: UserRequest): Promise<void> => {
    return axiosInstance.patch<void>(`/stores/${storeId}/manager/users/${userId}`, userData).then(() => undefined);
  },

  // 有効無効切り替えは編集モーダル内(update)でしか行わないため、コメントアウト
  // enableUser: (storeId: string, userId: string): Promise<User> =>
  //   axiosInstance.patch<User>(`/stores/${storeId}/manager/users/${userId}/enable`).then(res => res.data),

  // disableUser: (storeId: string, userId: string): Promise<User> =>
  //   axiosInstance.patch<User>(`/stores/${storeId}/manager/users/${userId}/disable`).then(res => res.data),

  deleteUser: (storeId: string, userId: string): Promise<void> =>
    axiosInstance.delete<void>(`/stores/${storeId}/manager/users/${userId}`).then(() => undefined),
};