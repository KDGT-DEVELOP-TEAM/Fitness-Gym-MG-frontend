import axiosInstance from './axiosConfig';
import { Posture, PostureComparison } from '../types/posture';
import { PaginatedResponse, PaginationParams } from '../types/common';

export const postureApi = {
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<Posture>> => {
    const response = await axiosInstance.get<PaginatedResponse<Posture>>('/postures', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Posture> => {
    const response = await axiosInstance.get<Posture>(`/postures/${id}`);
    return response.data;
  },

  getByCustomerId: async (customerId: string): Promise<Posture[]> => {
    const response = await axiosInstance.get<Posture[]>(`/postures/customer/${customerId}`);
    return response.data;
  },

  create: async (formData: FormData): Promise<Posture> => {
    const response = await axiosInstance.post<Posture>('/postures', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  compare: async (beforeId: string, afterId: string): Promise<PostureComparison> => {
    const response = await axiosInstance.post<PostureComparison>('/postures/compare', {
      beforeId,
      afterId,
    });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/postures/${id}`);
  },
};

