import axiosInstance from './axiosConfig';

export interface PostureGroup {
  id: string;
  lessonId: string;
  customerId: string;
  // その他のフィールド
  [key: string]: any;
}

export interface PostureImage {
  id: string;
  postureGroupId: string;
  storageKey: string;
  position: string;
  takenAt: string;
  createdAt: string;
  signedUrl: string;
  consentPublication: boolean;
}

export const postureApi = {
  getPostureGroups: (customerId: string): Promise<PostureGroup[]> =>
    axiosInstance.get<PostureGroup[]>(`/api/customers/${customerId}/posture_groups`).then(res => res.data),

  createPostureGroup: (lessonId: string): Promise<PostureGroup> =>
    axiosInstance.post<PostureGroup>(`/api/lessons/${lessonId}/posture_groups`).then(res => res.data),

  uploadImage: async (file: File, postureGroupId: string, position: string): Promise<PostureImage> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('postureGroupId', postureGroupId);
    formData.append('position', position);
    formData.append('consentPublication', 'false');

    const response = await axiosInstance.post<PostureImage>('/api/posture_images/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  getBatchSignedUrls: (imageIds: string[], expiresIn: number = 3600): Promise<{ urls: Array<{ imageId: string; signedUrl: string; expiresAt: string }> }> =>
    axiosInstance.post('/api/posture_images/signed-urls', { imageIds, expiresIn }).then(res => res.data),

  deleteImage: (imageId: string): Promise<void> =>
    axiosInstance.delete<void>(`/api/posture_images/${imageId}`).then(res => res.data),
};