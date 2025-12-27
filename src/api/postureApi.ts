import axiosInstance from './axiosConfig';
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
  getPostureGroups: (customerId: string) =>
    axiosInstance.get(`/api/customers/${customerId}/posture_groups`).then(res => res.data),

  createPostureGroup: (lessonId: string) =>
    axiosInstance.post(`/api/lessons/${lessonId}/posture_groups`).then(res => res.data),

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

    const response = await axiosInstance.post('/api/posture_images/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  getBatchSignedUrls: (imageIds: string[], expiresIn: number = 3600): Promise<{ urls: Array<{ imageId: string; signedUrl: string; expiresAt: string }> }> =>
    axiosInstance.post('/api/posture_images/signed-urls', { imageIds, expiresIn }).then(res => res.data),

  deleteImage: (imageId: string) =>
    axiosInstance.delete(`/api/posture_images/${imageId}`).then(res => res.data),
};
