import axiosInstance from './axiosConfig';
import { Posture, PostureComparison, PostureGroupResponse, PostureImageUploadResponse, BatchSignedUrlResponse } from '../types/posture';

export const postureApi = {
  /**
   * 顧客の姿勢グループ一覧を取得
   * GET /api/customers/{customer_id}/posture_groups
   * レスポンス: PostureGroupResponse[]
   */
  getPostureGroups: (customerId: string): Promise<PostureGroupResponse[]> =>
    axiosInstance.get<PostureGroupResponse[]>(`/api/customers/${customerId}/posture_groups`).then(res => res.data),

  /**
   * レッスンに紐づく姿勢グループを作成
   * POST /api/lessons/{lesson_id}/posture_groups
   * リクエストボディ: なし（lessonIdのみ）
   * レスポンス: PostureGroupResponse
   */
  createPostureGroup: (lessonId: string): Promise<PostureGroupResponse> =>
    axiosInstance.post<PostureGroupResponse>(`/api/lessons/${lessonId}/posture_groups`).then(res => res.data),

  /**
   * 姿勢画像をアップロード
   * POST /api/posture_images/upload
   * リクエスト: MultipartFormData
   *   - file: File
   *   - postureGroupId: UUID (string)
   *   - position: "front" | "right" | "back" | "left"
   *   - consentPublication: boolean (default: false)
   *   - takenAt: OffsetDateTime (optional)
   * レスポンス: PostureImageUploadResponse
   */
  uploadImage: async (
    file: File,
    postureGroupId: string,
    position: string,
    consentPublication: boolean = false,
    takenAt?: string
  ): Promise<PostureImageUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('postureGroupId', postureGroupId);
    formData.append('position', position);
    formData.append('consentPublication', String(consentPublication));
    if (takenAt) {
      formData.append('takenAt', takenAt);
    }

    const response = await axiosInstance.post<PostureImageUploadResponse>('/api/posture_images/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  /**
   * バッチ署名付きURL取得
   * POST /api/posture_images/signed-urls
   * リクエスト: { imageIds: UUID[], expiresIn: number }
   * レスポンス: BatchSignedUrlResponse
   */
  getBatchSignedUrls: (imageIds: string[], expiresIn: number = 3600): Promise<BatchSignedUrlResponse> =>
    axiosInstance.post<BatchSignedUrlResponse>('/api/posture_images/signed-urls', { imageIds, expiresIn }).then(res => res.data),

  /**
   * 画像削除
   * DELETE /api/posture_images/{imageId}
   * レスポンス: 204 No Content (void)
   */
  deleteImage: (imageId: string): Promise<void> =>
    axiosInstance.delete(`/api/posture_images/${imageId}`).then(() => undefined),
};
