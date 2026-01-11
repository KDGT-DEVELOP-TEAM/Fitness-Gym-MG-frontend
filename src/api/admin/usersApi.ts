import axiosInstance from '../axiosConfig';
import { convertPageResponse, PaginatedResponse, SpringPage } from '../../utils/pagination';
import { User, UserRequest, UserListParams } from '../../types/api/user';

export const adminUsersApi = {
  getUsers: (params?: UserListParams): Promise<PaginatedResponse<User>> => {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', String(params.page));
    if (params?.size !== undefined) queryParams.append('size', String(params.size));
    if (params?.name) queryParams.append('name', params.name);
    if (params?.role) queryParams.append('role', params.role);
    if (params?.sort) queryParams.append('sort', params.sort);
    
    const queryString = queryParams.toString();
    const url = queryString ? `/admin/users?${queryString}` : '/admin/users';
    
    return axiosInstance.get<SpringPage<User>>(url)
      .then(res => convertPageResponse(res.data));
  },

  getUser: (userId: string): Promise<User> =>
    axiosInstance.get<User>(`/admin/users/${userId}`).then(res => res.data),

  // createUser: (userData: UserFormData): Promise<User> =>
  //   axiosInstance.post<User>('/admin/users', userData).then(res => res.data),
  createUser: (userData: UserRequest): Promise<void> => {
    return axiosInstance.post<void>('/admin/users', userData).then(() => undefined);
  },

  // updateUser: (userId: string, userData: UserFormData): Promise<User> =>
  //   axiosInstance.patch<User>(`/admin/users/${userId}`, userData).then(res => res.data),
  updateUser: (userId: string, userData: UserRequest): Promise<void> => {
    return axiosInstance.patch<void>(`/admin/users/${userId}`, userData).then(() => undefined);
  },

  // 有効無効切り替えは編集モーダル内(update)でしか行わないため、コメントアウト
  // enableUser: (userId: string): Promise<User> =>
  //   axiosInstance.patch<User>(`/admin/users/${userId}/enable`).then(res => res.data),

  // disableUser: (userId: string): Promise<User> =>
  //   axiosInstance.patch<User>(`/admin/users/${userId}/disable`).then(res => res.data),

  deleteUser: (userId: string): Promise<void> =>
    axiosInstance.delete<void>(`/admin/users/${userId}`).then(() => undefined),
};