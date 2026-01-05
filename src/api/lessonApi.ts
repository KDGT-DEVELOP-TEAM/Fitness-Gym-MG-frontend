import axiosInstance from './axiosConfig';
import {
  Lesson,
  LessonHistoryItem,
  LessonChartData,
  LessonRequest,
} from '../types/lesson';
import {
  convertPageResponse,
  PaginatedResponse,
  SpringPage,
} from '../utils/pagination';

/**
 * ============================
 * Query Params
 * ============================
 */

export interface LessonHistoryParams {
  storeId?: string; // 'all' または UUID
  page?: number;
  size?: number;
}

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
      `/api/customers/${customerId}/lessons`,
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
      `/api/lessons/${lessonId}`,
      data
    );
    return response.data;
  },

  /**
   * 単一レッスン取得
   */
  getById: async (lessonId: string): Promise<Lesson> => {
    const response = await axiosInstance.get<Lesson>(
      `/api/lessons/${lessonId}`
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
      `/api/customers/${customerId}/lessons`,
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
      `/lessons/next-by-trainer/${trainerId}`
    );
    return response.data;
  },

  // 以下のエンドポイントはバックエンドに実装されていないため、コメントアウト
  // 必要に応じてバックエンドに実装を追加するか、この機能を削除してください

  /**
   * レッスン履歴一覧（管理画面）
   * @deprecated バックエンドに実装されていません
   */
  // getHistory: async (
  //   params?: LessonHistoryParams
  // ): Promise<PaginatedResponse<LessonHistoryItem>> => {
  //   const query = new URLSearchParams();
  //   if (params?.storeId && params.storeId !== 'all') {
  //     query.append('storeId', params.storeId);
  //   }
  //   if (params?.page !== undefined) {
  //     query.append('page', String(params.page));
  //   }
  //   if (params?.size !== undefined) {
  //     query.append('size', String(params.size));
  //   }
  //   const response = await axiosInstance.get<
  //     SpringPage<LessonHistoryItem>
  //   >(`/api/lessons/history?${query.toString()}`);
  //   return convertPageResponse(response.data);
  // },

  /**
   * グラフ用データ取得
   * @deprecated バックエンドに実装されていません
   */
  // getChartData: async (
  //   storeId: string | undefined,
  //   type: 'week' | 'month'
  // ): Promise<LessonChartData> => {
  //   const query = new URLSearchParams();
  //   if (storeId && storeId !== 'all') {
  //     query.append('storeId', storeId);
  //   }
  //   query.append('type', type);
  //   const response = await axiosInstance.get<LessonChartData>(
  //     `/api/lessons/chart?${query.toString()}`
  //   );
  //   return response.data;
  // },

  /**
   * レッスン削除
   * @deprecated バックエンドに実装されていません
   */
  // delete: async (lessonId: string): Promise<void> => {
  //   await axiosInstance.delete(`/api/lessons/${lessonId}`);
  // },
};
