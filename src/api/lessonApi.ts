import axiosInstance from './axiosConfig';
import { Lesson, LessonFormData, TrainingInput } from '../types/lesson';
import { PaginatedResponse, PaginationParams } from '../types/common';
import { handleApiError, logError } from '../utils/errorHandler';
import { DEFAULT_PAGE, DEFAULT_PAGE_LIMIT } from '../constants/pagination';
import { toNull } from '../utils/dataTransformers';

/**
 * Map API response to Lesson type
 * Handles both camelCase and snake_case responses
 */
const mapLesson = (row: Lesson | any): Lesson => {
  // If already in correct format, return as is
  if (row.id && row.storeId !== undefined) {
    return row as Lesson;
  }
  
  // Map from snake_case if needed
  return {
    id: row.id,
    storeId: row.store_id ?? row.storeId,
    userId: row.user_id ?? row.userId,
    customerId: row.customer_id ?? row.customerId,
    postureGroupId: row.posture_group_id ?? row.postureGroupId,
    condition: row.condition,
    weight: row.weight,
    meal: row.meal,
    memo: row.memo,
    startDate: row.start_date ?? row.startDate,
    endDate: row.end_date ?? row.endDate,
    nextDate: row.next_date ?? row.nextDate,
    nextStoreId: row.next_store_id ?? row.nextStoreId,
    nextUserId: row.next_user_id ?? row.nextUserId,
    createdAt: row.created_at ?? row.createdAt,
  };
};

/**
 * レッスンAPI
 * レッスンのCRUD操作を処理
 */
export const lessonApi = {
  /**
   * ページネーション付きで全レッスンを取得
   * 
   * @param params - ページネーションパラメータ（page, limit）
   * @returns レッスンを含むページネーション付きレスポンス
   */
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<Lesson>> => {
    try {
      const page = params?.page ?? DEFAULT_PAGE;
      const limit = params?.limit ?? DEFAULT_PAGE_LIMIT;
      
      const response = await axiosInstance.get<PaginatedResponse<Lesson>>('/lessons', {
        params: { page, limit },
      });
      
      if (!response.data || !Array.isArray(response.data.data)) {
        throw new Error('Invalid response format from /lessons');
      }
      
      const mapped = response.data.data.map(mapLesson);
      return {
        data: mapped,
        total: response.data.total ?? mapped.length,
        page: response.data.page ?? page,
        limit: response.data.limit ?? limit,
      };
    } catch (error) {
      const appError = handleApiError(error);
      logError(appError, 'lessonApi.getAll');
      throw appError;
    }
  },

  /**
   * IDでレッスンを取得
   * 
   * @param id - レッスンID
   * @returns レッスンデータ
   */
  getById: async (id: string): Promise<Lesson> => {
    try {
      const response = await axiosInstance.get<Lesson>(`/lessons/${id}`);
      return mapLesson(response.data);
    } catch (error) {
      const appError = handleApiError(error);
      logError(appError, 'lessonApi.getById');
      throw appError;
    }
  },

  getByCustomerId: async (customerId: string): Promise<Lesson[]> => {
    try {
      const response = await axiosInstance.get<Lesson[]>(`/customers/${customerId}/lessons`);
      if (!Array.isArray(response.data)) {
        throw new Error('Invalid response format from /customers/:customerId/lessons');
      }
      return response.data.map(mapLesson);
    } catch (error) {
      const appError = handleApiError(error);
      logError(appError, 'lessonApi.getByCustomerId');
      throw appError;
    }
  },

  /**
   * 新しいレッスンを作成
   * 提供された場合は関連するトレーニングも作成
   * 
   * @param data - レッスンフォームデータ
   * @returns 作成されたレッスン
   */
  create: async (data: LessonFormData): Promise<Lesson> => {
    try {
      const requestData = {
        storeId: toNull(data.storeId),
        userId: toNull(data.userId),
        customerId: toNull(data.customerId),
        postureGroupId: toNull(data.postureGroupId ?? null),
        condition: data.condition ?? null,
        weight: data.weight ?? null,
        meal: data.meal ?? null,
        memo: data.memo ?? null,
        startDate: data.startDate && data.startDate !== '' ? data.startDate : null,
        endDate: data.endDate && data.endDate !== '' ? data.endDate : null,
        nextDate: data.nextDate && data.nextDate !== '' ? data.nextDate : null,
        nextStoreId: toNull(data.nextStoreId ?? null),
        nextUserId: toNull(data.nextUserId ?? null),
        trainings: data.trainings?.map((t: TrainingInput, idx) => ({
          orderNo: t.orderNo ?? idx + 1,
          name: t.name,
          reps: t.reps,
        })) ?? [],
      };
      
      const response = await axiosInstance.post<Lesson>('/lessons', requestData);
      return mapLesson(response.data);
    } catch (error) {
      const appError = handleApiError(error);
      logError(appError, 'lessonApi.create');
      throw appError;
    }
  },

  update: async (id: string, data: Partial<LessonFormData>): Promise<Lesson> => {
    try {
      const updateData: any = {};
      if (data.storeId !== undefined) updateData.storeId = toNull(data.storeId);
      if (data.userId !== undefined) updateData.userId = toNull(data.userId);
      if (data.customerId !== undefined) updateData.customerId = toNull(data.customerId);
      if (data.postureGroupId !== undefined) updateData.postureGroupId = toNull(data.postureGroupId ?? null);
      if (data.condition !== undefined) updateData.condition = data.condition ?? null;
      if (data.weight !== undefined) updateData.weight = data.weight ?? null;
      if (data.meal !== undefined) updateData.meal = data.meal ?? null;
      if (data.memo !== undefined) updateData.memo = data.memo ?? null;
      if (data.startDate !== undefined) updateData.startDate = data.startDate && data.startDate !== '' ? data.startDate : null;
      if (data.endDate !== undefined) updateData.endDate = data.endDate && data.endDate !== '' ? data.endDate : null;
      if (data.nextDate !== undefined) updateData.nextDate = data.nextDate && data.nextDate !== '' ? data.nextDate : null;
      if (data.nextStoreId !== undefined) updateData.nextStoreId = toNull(data.nextStoreId ?? null);
      if (data.nextUserId !== undefined) updateData.nextUserId = toNull(data.nextUserId ?? null);
      
      const response = await axiosInstance.put<Lesson>(`/lessons/${id}`, updateData);
      return mapLesson(response.data);
    } catch (error) {
      const appError = handleApiError(error);
      logError(appError, 'lessonApi.update');
      throw appError;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await axiosInstance.delete(`/lessons/${id}`);
    } catch (error) {
      const appError = handleApiError(error);
      logError(appError, 'lessonApi.delete');
      throw appError;
    }
  },
};

