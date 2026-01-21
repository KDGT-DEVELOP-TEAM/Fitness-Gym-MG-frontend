import axiosInstance from './axiosConfig';
import { Posture, PostureComparison, PostureGroupResponse, PostureImageUploadResponse, SignedUrlResponse, BatchSignedUrlResponse } from '../types/posture';
import { API_ENDPOINTS } from '../constants/apiEndpoints';
import { SIGNED_URL_CONSTANTS } from '../constants/time';

export const postureApi = {
  /**
   * 顧客の姿勢グループ一覧を取得
   * GET /api/customers/{customer_id}/posture_groups
   * レスポンス: PostureGroupResponse[]
   */
  getPostureGroups: (customerId: string): Promise<PostureGroupResponse[]> =>
    axiosInstance.get<PostureGroupResponse[]>(API_ENDPOINTS.POSTURE_GROUPS.BY_CUSTOMER(customerId)).then(res => res.data),

  /**
   * レッスンに紐づく姿勢グループを作成
   * POST /api/lessons/{lesson_id}/posture_groups
   * リクエストボディ: なし（lessonIdのみ）
   * レスポンス: PostureGroupResponse
   */
  createPostureGroup: (lessonId: string): Promise<PostureGroupResponse> =>
    axiosInstance.post<PostureGroupResponse>(API_ENDPOINTS.POSTURE_GROUPS.BY_LESSON_CREATE(lessonId)).then(res => res.data),

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

    const response = await axiosInstance.post<PostureImageUploadResponse>(API_ENDPOINTS.POSTURE_IMAGES.UPLOAD, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  /**
   * 単一の署名付きURL取得
   * GET /api/posture_images/{imageId}/signed-url
   * クエリパラメータ: expiresIn (optional, default: SIGNED_URL_CONSTANTS.DEFAULT_EXPIRES_IN)
   * レスポンス: SignedUrlResponse
   */
  getSignedUrl: (imageId: string, expiresIn: number = SIGNED_URL_CONSTANTS.DEFAULT_EXPIRES_IN): Promise<SignedUrlResponse> => {
    const queryParams = new URLSearchParams();
    if (expiresIn !== SIGNED_URL_CONSTANTS.DEFAULT_EXPIRES_IN) {
      queryParams.append('expiresIn', String(expiresIn));
    }
    const queryString = queryParams.toString();
    const baseUrl = API_ENDPOINTS.POSTURE_IMAGES.SIGNED_URL(imageId);
    const url = queryString ? `${baseUrl}?${queryString}` : baseUrl;
    return axiosInstance.get<SignedUrlResponse>(url).then(res => res.data);
  },

  /**
   * バッチ署名付きURL取得
   * POST /api/posture_images/signed-urls
   * リクエスト: { imageIds: UUID[], expiresIn: number }
   * レスポンス: BatchSignedUrlResponse
   * 
   * 注意: imageIdsの件数はSIGNED_URL_CONSTANTS.MAX_BATCH_COUNT（50件）以下であること
   */
  getBatchSignedUrls: (imageIds: string[], expiresIn: number = SIGNED_URL_CONSTANTS.DEFAULT_EXPIRES_IN): Promise<BatchSignedUrlResponse> =>
    axiosInstance.post<BatchSignedUrlResponse>(API_ENDPOINTS.POSTURE_IMAGES.BATCH_SIGNED_URLS, { imageIds, expiresIn }).then(res => res.data),

  /**
   * 画像削除
   * DELETE /api/posture_images/{imageId}
   * レスポンス: 204 No Content (void)
   */
  deleteImage: (imageId: string): Promise<void> =>
    axiosInstance.delete(API_ENDPOINTS.POSTURE_IMAGES.BY_ID(imageId)).then(() => undefined),
};
