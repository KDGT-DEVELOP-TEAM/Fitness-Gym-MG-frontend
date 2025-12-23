import { apiClient } from '../client';

export interface CustomerListParams {
  page?: number;
  size?: number;
  name?: string;
  kana?: string;
  active?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export const adminCustomersApi = {
  getCustomers: (params?: CustomerListParams): Promise<PaginatedResponse<any>> => {
    const queryString = new URLSearchParams(params as any).toString();
    return apiClient.get(`/api/admin/customers?${queryString}`);
  },
  createCustomer: (customerData: any) => 
    apiClient.post('/api/admin/customers', customerData),
  enableCustomer: (customerId: string) => 
    apiClient.patch(`/api/admin/customers/${customerId}/enable`),
  disableCustomer: (customerId: string) => 
    apiClient.patch(`/api/admin/customers/${customerId}/disable`),
  deleteCustomer: (customerId: string) => 
    apiClient.delete(`/api/admin/customers/${customerId}`),
};
