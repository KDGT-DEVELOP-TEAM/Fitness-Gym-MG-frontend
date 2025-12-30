import axiosInstance from '../axiosConfig';
import { convertPageResponse, PaginatedResponse, SpringPage } from '../../utils/pagination';
import { User, UserRequest, UserListParams } from '../../types/api/user';
import { UserFormData } from '../../types/form/user';

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
  createUser: (storeId: string, formData: UserFormData): Promise<User> => {
    const request: UserRequest = {
      ...formData,
      // 必要に応じて型変換のロジックをここに挟む
    };
    return axiosInstance.post<User>(`/stores/${storeId}/manager/users`, request).then(res => res.data);
  },

  // updateUser: (storeId: string, userId: string, userData: UserFormData): Promise<User> =>
  //   axiosInstance.patch<User>(`/stores/${storeId}/manager/users/${userId}`, userData).then(res => res.data),
  updateUser: (storeId: string, userId: string, formData: Partial<UserFormData> & { active?: boolean }): Promise<User> => {
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

    return axiosInstance.patch<User>(`/stores/${storeId}/manager/users/${userId}`, request).then(res => res.data);
  },

  // 有効無効切り替えは編集モーダル内(update)でしか行わないため、コメントアウト
  // enableUser: (storeId: string, userId: string): Promise<User> =>
  //   axiosInstance.patch<User>(`/stores/${storeId}/manager/users/${userId}/enable`).then(res => res.data),

  // disableUser: (storeId: string, userId: string): Promise<User> =>
  //   axiosInstance.patch<User>(`/stores/${storeId}/manager/users/${userId}/disable`).then(res => res.data),

  deleteUser: (storeId: string, userId: string): Promise<void> =>
    axiosInstance.delete<void>(`/stores/${storeId}/manager/users/${userId}`).then(res => res.data),
};