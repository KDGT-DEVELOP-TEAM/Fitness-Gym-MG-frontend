import axiosInstance from '../axiosConfig';
import { convertPageResponse, PaginatedResponse, SpringPage } from '../../utils/pagination';
import { User, UserRequest, UserListParams } from '../../types/api/user';
import { UserFormData } from '../../types/form/user';

export const adminUsersApi = {
  getUsers: (params?: UserListParams): Promise<PaginatedResponse<User>> => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return axiosInstance.get<SpringPage<User>>(`/admin/users?${query}`)
      .then(res => convertPageResponse(res.data));
  },

  getUser: (userId: string): Promise<User> =>
    axiosInstance.get<User>(`/admin/users/${userId}`).then(res => res.data),

  // createUser: (userData: UserFormData): Promise<User> =>
  //   axiosInstance.post<User>('/admin/users', userData).then(res => res.data),
  createUser: (formData: UserFormData): Promise<User> => {
    const request: UserRequest = {
      ...formData,
      // 必要に応じて型変換のロジックをここに挟む
    };
    return axiosInstance.post<User>('/admin/users', request).then(res => res.data);
  },

  // updateUser: (userId: string, userData: UserFormData): Promise<User> =>
  //   axiosInstance.patch<User>(`/admin/users/${userId}`, userData).then(res => res.data),
  updateUser: (userId: string, formData: Partial<UserFormData> & { active?: boolean }): Promise<User> => {
    const request: UserRequest = {
      email: formData.email!,
      name: formData.name!,
      kana: formData.kana!,
      role: formData.role!,
      storeIds: formData.storeIds,
      isActive: formData.active,
    };
    
    // パスワードが入力されている場合のみリクエストに含める
    if (formData.pass && formData.pass.trim() !== '') {
      request.pass = formData.pass;
    }

    return axiosInstance.patch<User>(`/admin/users/${userId}`, request).then(res => res.data);
  },

  // 有効無効切り替えは編集モーダル内(update)でしか行わないため、コメントアウト
  // enableUser: (userId: string): Promise<User> =>
  //   axiosInstance.patch<User>(`/admin/users/${userId}/enable`).then(res => res.data),

  // disableUser: (userId: string): Promise<User> =>
  //   axiosInstance.patch<User>(`/admin/users/${userId}/disable`).then(res => res.data),

  deleteUser: (userId: string): Promise<void> =>
    axiosInstance.delete<void>(`/admin/users/${userId}`).then(res => res.data),
};