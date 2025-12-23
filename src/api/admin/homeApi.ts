import { apiClient } from '../client';

export const adminHomeApi = {
  getHome: () => apiClient.get('/api/admin/home'),
};
