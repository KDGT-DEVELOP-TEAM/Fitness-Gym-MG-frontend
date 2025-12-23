import { apiClient } from '../client';

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export const managerCustomersApi = {
  getCustomers: (storeId: string, params?: any): Promise<PaginatedResponse<any>> => {
    const queryString = new URLSearchParams(params).toString();
    return apiClient.get(`/api/stores/${storeId}/manager/customers?${queryString}`);
  },
  createCustomer: (storeId: string, customerData: any) =>
    apiClient.post(`/api/stores/${storeId}/manager/customers`, customerData),
  enableCustomer: (storeId: string, customerId: string) =>
    apiClient.patch(`/api/stores/${storeId}/manager/customers/${customerId}/enable`),
  disableCustomer: (storeId: string, customerId: string) =>
    apiClient.patch(`/api/stores/${storeId}/manager/customers/${customerId}/disable`),
  deleteCustomer: (storeId: string, customerId: string) =>
    apiClient.delete(`/api/stores/${storeId}/manager/customers/${customerId}`),
};
