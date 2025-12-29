import axiosInstance from './axiosConfig';
import { Lesson, TrainingResponse } from '../types/lesson';
import { convertPageResponse, PaginatedResponse, SpringPage } from '../utils/pagination';

/**
 * バックエンドのLessonRequestに対応する型
 */
export interface LessonCreateRequest {
  storeId: string; // UUID (必須)
  trainerId: string; // UUID (必須)
  condition?: string | null; // String (最大500文字)
  weight?: number | null; // BigDecimal (0.0以上500.0以下)
  meal?: string | null; // String (最大500文字)
  memo?: string | null; // String (最大1000文字)
  startDate: string; // LocalDateTime (必須)
  endDate: string; // LocalDateTime (必須)
  nextDate?: string | null; // LocalDateTime (オプション)
  nextStoreId?: string | null; // UUID (オプション)
  nextTrainerId?: string | null; // UUID (オプション)
  trainings?: Array<{
    orderNo: number; // Integer (必須, 1以上)
    name: string; // String (必須, 最大100文字)
    reps: number; // Integer (必須, 1以上, 最大値制限あり)
  }>; // List<TrainingRequest> (最大件数制限あり)
}

export const lessonApi = {
  /**
   * レッスン作成
   * POST /api/customers/{customer_id}/lessons
   * リクエスト: LessonRequest
   * レスポンス: LessonResponse (詳細情報を含む)
   */
  createLesson: (customerId: string, lessonData: LessonCreateRequest): Promise<Lesson> =>
    axiosInstance.post<Lesson>(`/api/customers/${customerId}/lessons`, lessonData).then(res => res.data),

  /**
   * 顧客のレッスン一覧取得（ページネーション）
   * GET /api/customers/{customer_id}/lessons
   * レスポンス: Page<LessonResponse>
   */
  getLessons: (customerId: string, params?: { page?: number; size?: number }): Promise<PaginatedResponse<Lesson>> => {
    const queryString = new URLSearchParams(params as any).toString();
    return axiosInstance.get<SpringPage<Lesson>>(`/api/customers/${customerId}/lessons?${queryString}`)
      .then(res => convertPageResponse(res.data));
  },

  /**
   * レッスン詳細取得
   * GET /api/lessons/{lesson_id}
   * レスポンス: LessonResponse
   */
  getLesson: (lessonId: string): Promise<Lesson> =>
    axiosInstance.get<Lesson>(`/api/lessons/${lessonId}`).then(res => res.data),

  /**
   * レッスン更新
   * PATCH /api/lessons/{lesson_id}
   * リクエスト: LessonRequest
   * レスポンス: LessonResponse
   */
  updateLesson: (lessonId: string, lessonData: LessonCreateRequest): Promise<Lesson> =>
    axiosInstance.patch<Lesson>(`/api/lessons/${lessonId}`, lessonData).then(res => res.data),
};
