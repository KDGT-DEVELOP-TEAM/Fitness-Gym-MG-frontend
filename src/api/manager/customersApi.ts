import axiosInstance from '../axiosConfig';
import { convertPageResponse, PaginatedResponse, SpringPage } from '../../utils/pagination';
import { Customer, CustomerFormData, CustomerListParams } from '../../types/customer';

export const managerCustomersApi = {
  getCustomers: (storeId: string, params?: CustomerListParams): Promise<PaginatedResponse<Customer>> => {
    const queryString = new URLSearchParams(params as Record<string, string>).toString();
    return axiosInstance.get<SpringPage<Customer>>(`/stores/${storeId}/manager/customers?${queryString}`)
      .then(res => convertPageResponse(res.data));
  },

  getCustomer: (storeId: string, customerId: string): Promise<Customer> =>
    axiosInstance.get<Customer>(`/stores/${storeId}/manager/customers/${customerId}`).then(res => res.data),

  createCustomer: (storeId: string, customerData: CustomerFormData): Promise<Customer> =>
    axiosInstance.post<Customer>(`/stores/${storeId}/manager/customers`, customerData).then(res => res.data),

  updateCustomer: (storeId: string, customerId: string, customerData: CustomerFormData): Promise<Customer> =>
    axiosInstance.patch<Customer>(`/stores/${storeId}/manager/customers/${customerId}`, customerData).then(res => res.data),

  // 有効無効切り替えは編集モーダル内(update)でしか行わないため、コメントアウト
  // enableCustomer: (storeId: string, customerId: string): Promise<Customer> =>
  //   axiosInstance.patch<Customer>(`/stores/${storeId}/manager/customers/${customerId}/enable`).then(res => res.data),

  // disableCustomer: (storeId: string, customerId: string): Promise<Customer> =>
  //   axiosInstance.patch<Customer>(`/stores/${storeId}/manager/customers/${customerId}/disable`).then(res => res.data),

  deleteCustomer: (storeId: string, customerId: string): Promise<void> =>
    axiosInstance.delete<void>(`/stores/${storeId}/manager/customers/${customerId}`).then(res => res.data),
};