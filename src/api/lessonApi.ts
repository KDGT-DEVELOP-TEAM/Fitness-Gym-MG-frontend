import axiosInstance from './axiosConfig';
import { Lesson, LessonFormData } from '../types/lesson';
import { PaginatedResponse, PaginationParams } from '../types/common';

export const lessonApi = {
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<Lesson>> => {
    const response = await axiosInstance.get<PaginatedResponse<Lesson>>('/lessons', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Lesson> => {
    const response = await axiosInstance.get<Lesson>(`/lessons/${id}`);
    return response.data;
  },

  getByCustomerId: async (customerId: string): Promise<Lesson[]> => {
    const response = await axiosInstance.get<Lesson[]>(`/lessons/customer/${customerId}`);
    return response.data;
  },

  create: async (data: LessonFormData): Promise<Lesson> => {
    const response = await axiosInstance.post<Lesson>('/lessons', data);
    return response.data;
  },

  update: async (id: string, data: Partial<LessonFormData>): Promise<Lesson> => {
    const response = await axiosInstance.put<Lesson>(`/lessons/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/lessons/${id}`);
  },
};

