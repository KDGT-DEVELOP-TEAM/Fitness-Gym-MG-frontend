import { apiClient } from './client';
import { Lesson } from '../types/lesson';

export interface LessonCreateRequest {
  customerId: string;
  storeId: string;
  trainerId: string;
  lessonDate: string;
  trainings: Array<{
    menuName: string;
    weight?: number;
    reps?: number;
    sets?: number;
    duration?: number;
  }>;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export const lessonApi = {
  getAll: (params?: PaginationParams): Promise<PaginatedResponse<Lesson>> =>
    apiClient.get(`/api/lessons?page=${params?.page || 1}&limit=${params?.limit || 10}`),

  create: (lessonData: any): Promise<Lesson> =>
    apiClient.post('/api/lessons', lessonData),

  createLesson: (customerId: string, lessonData: LessonCreateRequest) =>
    apiClient.post(`/api/customers/${customerId}/lessons`, lessonData),

  getLessons: (customerId: string, params?: { page?: number; size?: number }) => {
    const queryString = new URLSearchParams(params as any).toString();
    return apiClient.get(`/api/customers/${customerId}/lessons?${queryString}`);
  },

  getByCustomerId: (customerId: string): Promise<Lesson[]> =>
    apiClient.get(`/api/customers/${customerId}/lessons`),

  getById: (lessonId: string): Promise<Lesson> =>
    apiClient.get(`/api/lessons/${lessonId}`),

  getLesson: (lessonId: string): Promise<Lesson> =>
    apiClient.get(`/api/lessons/${lessonId}`),

  updateLesson: (lessonId: string, lessonData: any) =>
    apiClient.patch(`/api/lessons/${lessonId}`, lessonData),
};
