import axiosInstance from '../axiosConfig';
import { convertPageResponse, PaginatedResponse, SpringPage } from '../../utils/pagination';

export const managerCustomersApi = {
  getCustomers: (storeId: string, params?: any): Promise<PaginatedResponse<any>> => {
    const queryString = new URLSearchParams(params).toString();
    return axiosInstance.get<SpringPage<any>>(`/api/stores/${storeId}/manager/customers?${queryString}`)
      .then(res => convertPageResponse(res.data));
  },
  createCustomer: (storeId: string, customerData: any) =>
    axiosInstance.post(`/api/stores/${storeId}/manager/customers`, customerData).then(res => res.data),
  enableCustomer: (storeId: string, customerId: string) =>
    axiosInstance.patch(`/api/stores/${storeId}/manager/customers/${customerId}/enable`).then(res => res.data),
  disableCustomer: (storeId: string, customerId: string) =>
    axiosInstance.patch(`/api/stores/${storeId}/manager/customers/${customerId}/disable`).then(res => res.data),
  deleteCustomer: (storeId: string, customerId: string) =>
    axiosInstance.delete(`/api/stores/${storeId}/manager/customers/${customerId}`).then(res => res.data),
};
