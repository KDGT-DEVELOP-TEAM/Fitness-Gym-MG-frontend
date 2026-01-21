import axiosInstance from './axiosConfig';
import {
  Lesson,
  LessonRequest,
} from '../types/lesson';
import {
  convertPageResponse,
  PaginatedResponse,
  SpringPage,
} from '../utils/pagination';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

/**
 * ============================
 * Lesson API
 * ============================
 * ・REST責務を厳密に統一
 * ・any 排除
 * ・型はすべて src/types に集約
 */

export const lessonApi = {
  /**
   * レッスン作成
   * POST /api/customers/{customerId}/lessons
   */
  create: async (customerId: string, data: LessonRequest): Promise<Lesson> => {
    const response = await axiosInstance.post<Lesson>(
      API_ENDPOINTS.LESSONS.BY_CUSTOMER_CREATE(customerId),
      data
    );
    return response.data;
  },

  /**
   * レッスン更新（部分更新）
   */
  update: async (
    lessonId: string,
    data: Partial<LessonRequest>
  ): Promise<Lesson> => {
    const response = await axiosInstance.patch<Lesson>(
      API_ENDPOINTS.LESSONS.BY_ID(lessonId),
      data
    );
    return response.data;
  },

  /**
   * 単一レッスン取得
   */
  getById: async (lessonId: string): Promise<Lesson> => {
    const response = await axiosInstance.get<Lesson>(
      API_ENDPOINTS.LESSONS.BY_ID(lessonId)
    );
    return response.data;
  },

  /**
   * 顧客別レッスン一覧（ページング）
   */
  getByCustomer: async (
    customerId: string,
    params?: { page?: number; size?: number }
  ): Promise<PaginatedResponse<Lesson>> => {
    const response = await axiosInstance.get<SpringPage<Lesson>>(
      API_ENDPOINTS.LESSONS.BY_CUSTOMER(customerId),
      { params }
    );
    return convertPageResponse(response.data);
  },

  /**
   * トレーナー別の次回レッスン希望日程一覧取得
   * GET /api/lessons/next-by-trainer/{trainer_id}
   */
  getNextLessonsByTrainer: async (trainerId: string): Promise<Lesson[]> => {
    const response = await axiosInstance.get<Lesson[]>(
      API_ENDPOINTS.LESSONS.NEXT_BY_TRAINER(trainerId)
    );
    return response.data;
  },
};
