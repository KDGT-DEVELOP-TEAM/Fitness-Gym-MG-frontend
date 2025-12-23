import { apiClient } from '../client';

export const managerHomeApi = {
  getHome: (storeId: string) => 
    apiClient.get(`/api/stores/${storeId}/manager/home`),
};
