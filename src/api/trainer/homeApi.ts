import { apiClient } from '../client';

export const trainerHomeApi = {
  getHome: () => apiClient.get('/api/trainers/home'),
};
