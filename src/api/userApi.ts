import axiosInstance from './axiosConfig';
import { User, UserRequest } from '../types/api/user';
import { PaginatedResponse, PaginationParams } from '../types/common';

export const userApi = {
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<User>> => {
    const response = await axiosInstance.get<PaginatedResponse<User>>('/users', { params });
    return response.data;
  },

  getById: async (id: string): Promise<User> => {
    const response = await axiosInstance.get<User>(`/users/${id}`);
    return response.data;
  },

  create: async (data: UserRequest): Promise<User> => {
    const response = await axiosInstance.post<User>('/users', data);
    return response.data;
  },

  update: async (id: string, data: Partial<UserRequest>): Promise<User> => {
    const response = await axiosInstance.put<User>(`/users/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/users/${id}`);
  },
};

