import axiosInstance from './axiosConfig';
import { PostureGroup, PostureImage, SignedUrl } from '../types/posture';

export const postureApi = {
getGroupsByCustomer: (customerId: string): Promise<PostureGroup[]> =>
axiosInstance.get(`/customers/${customerId}/posture-groups`).then(res => res.data),

createGroup: (lessonId: string): Promise<PostureGroup> =>
axiosInstance.post(`/lessons/${lessonId}/posture-groups`).then(res => res.data),

uploadImage: (formData: FormData): Promise<PostureImage> =>
axiosInstance.post('/posture-images', formData).then(res => res.data),

getSignedUrls: (imageIds: string[], expiresIn = 3600): Promise<SignedUrl[]> =>
axiosInstance.post('/posture-images/signed-urls', { imageIds, expiresIn }).then(res => res.data),

deleteImage: (imageId: string): Promise<PostureImage> =>
axiosInstance.delete(`/posture-images/${imageId}`).then(res => res.data),
};