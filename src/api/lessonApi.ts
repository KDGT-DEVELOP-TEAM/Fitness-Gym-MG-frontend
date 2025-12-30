import axiosInstance from './axiosConfig';
import { Lesson, LessonFormData, AppointmentWithDetails } from '../types/lesson';
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
    const response = await axiosInstance.patch<Lesson>(`/lessons/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/lessons/${id}`);
  },

  // トレーナーの予約一覧を取得（顧客情報含む）
  getInstructorAppointments: async (
    instructorId: string,
    params?: { search?: string; limit?: number; offset?: number }
  ): Promise<AppointmentWithDetails[]> => {
    const response = await axiosInstance.get<AppointmentWithDetails[]>(
      `/lessons/instructor/${instructorId}/appointments`,
      { params }
    );
    return response.data;
  },
};

