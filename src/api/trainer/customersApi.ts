import { apiClient } from '../client';

export const trainerCustomersApi = {
  getCustomers: (storeId: string): Promise<any[]> =>
    apiClient.get(`/api/stores/${storeId}/trainers/customers`),
};
