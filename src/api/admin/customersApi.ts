import axiosInstance from '../axiosConfig';
import { convertPageResponse, PaginatedResponse, SpringPage } from '../../utils/pagination';

export interface CustomerListParams {
  page?: number;
  size?: number;
  name?: string;
  kana?: string;
  active?: boolean;
}

export const adminCustomersApi = {
  getCustomers: (params?: CustomerListParams): Promise<PaginatedResponse<any>> => {
    const queryString = new URLSearchParams(params as any).toString();
    return axiosInstance.get<SpringPage<any>>(`/api/admin/customers?${queryString}`)
      .then(res => convertPageResponse(res.data));
  },
  createCustomer: (customerData: any) => 
    axiosInstance.post('/api/admin/customers', customerData).then(res => res.data),
  enableCustomer: (customerId: string) => 
    axiosInstance.patch(`/api/admin/customers/${customerId}/enable`).then(res => res.data),
  disableCustomer: (customerId: string) => 
    axiosInstance.patch(`/api/admin/customers/${customerId}/disable`).then(res => res.data),
  deleteCustomer: (customerId: string) => 
    axiosInstance.delete(`/api/admin/customers/${customerId}`).then(res => res.data),
};
