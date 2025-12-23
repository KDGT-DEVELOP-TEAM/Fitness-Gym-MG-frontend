import { apiClient } from './client';
import { Posture, PostureComparison } from '../types/posture';

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

export const postureApi = {
  getAll: (params?: PaginationParams): Promise<PaginatedResponse<Posture>> =>
    apiClient.get(`/api/postures?page=${params?.page || 1}&limit=${params?.limit || 10}`),

  getById: (postureId: string): Promise<Posture> =>
    apiClient.get(`/api/postures/${postureId}`),

  getByCustomerId: (customerId: string): Promise<Posture[]> =>
    apiClient.get(`/api/customers/${customerId}/postures`),

  compare: (beforeId: string, afterId: string): Promise<PostureComparison> =>
    apiClient.post('/api/postures/compare', { beforeId, afterId }),

  getPostureGroups: (customerId: string) =>
    apiClient.get(`/api/customers/${customerId}/posture_groups`),

  createPostureGroup: (lessonId: string, groupData: any) =>
    apiClient.post(`/api/lessons/${lessonId}/posture_groups`, groupData),

  uploadImage: async (file: File, postureGroupId: string, position: string): Promise<{
    id: string;
    postureGroupId: string;
    storageKey: string;
    position: string;
    takenAt: string;
    createdAt: string;
    signedUrl: string;
    consentPublication: boolean;
  }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('postureGroupId', postureGroupId);
    formData.append('position', position);
    formData.append('consentPublication', 'false');

    return apiClient.postFormData('/api/posture-images/upload', formData);
  },

  getBatchSignedUrls: (imageIds: string[], expiresIn: number = 3600): Promise<{ urls: Array<{ imageId: string; signedUrl: string; expiresAt: string }> }> =>
    apiClient.post('/api/posture-images/signed-urls', { imageIds, expiresIn }),

  deleteImage: (imageId: string) =>
    apiClient.delete(`/api/posture-images/${imageId}`),
};
