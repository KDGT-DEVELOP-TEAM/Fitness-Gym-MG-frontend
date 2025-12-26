import axiosInstance from './axiosConfig';
import { Lesson, LessonHistoryItem, LessonChartData } from '../types/lesson';
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

export interface LessonHistoryParams {
  storeId?: string; // 特定店舗ID または 未指定(all)
  page?: number;    
  size?: number;    
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

  // レッスン履歴の取得
  getHistory: (params?: LessonHistoryParams): Promise<PaginatedResponse<LessonHistoryItem>> => {
    const query = new URLSearchParams();
    
    // バックエンドの searchLessons(UUID storeId, ...) の引数に対応
    if (params?.storeId && params.storeId !== 'all') {
      query.append('storeId', params.storeId);
    }
    if (params?.page !== undefined) {
      query.append('page', params.page.toString());
    }
    if (params?.size !== undefined) {
      query.append('size', params.size.toString());
    }

    return axiosInstance.get<SpringPage<LessonHistoryItem>>(`/api/lessons/history?${query.toString()}`)
      .then(res => convertPageResponse(res.data));
  },

  getChartData: (storeId: string | undefined, type: 'week' | 'month'): Promise<LessonChartData> => {
    const query = new URLSearchParams();
    if (storeId && storeId !== 'all') query.append('storeId', storeId);
    query.append('type', type);
    
    return axiosInstance.get<LessonChartData>(`/api/lessons/chart?${query.toString()}`)
      .then(res => res.data);
  },
};