import axiosInstance from './axiosConfig';
import { Lesson } from '../types/lesson';
import { convertPageResponse, PaginatedResponse, SpringPage } from '../utils/pagination';

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

export const lessonApi = {
  createLesson: (customerId: string, lessonData: LessonCreateRequest): Promise<Lesson> =>
    axiosInstance.post(`/api/customers/${customerId}/lessons`, lessonData).then(res => res.data),

  getLessons: (customerId: string, params?: { page?: number; size?: number }): Promise<PaginatedResponse<Lesson>> => {
    const queryString = new URLSearchParams(params as any).toString();
    return axiosInstance.get<SpringPage<Lesson>>(`/api/customers/${customerId}/lessons?${queryString}`)
      .then(res => convertPageResponse(res.data));
  },

  getByCustomerId: (customerId: string): Promise<Lesson[]> =>
    axiosInstance.get(`/api/customers/${customerId}/lessons`).then(res => res.data),

  getLesson: (lessonId: string): Promise<Lesson> =>
    axiosInstance.get(`/api/lessons/${lessonId}`).then(res => res.data),

  updateLesson: (lessonId: string, lessonData: any) =>
    axiosInstance.patch(`/api/lessons/${lessonId}`, lessonData).then(res => res.data),
};
