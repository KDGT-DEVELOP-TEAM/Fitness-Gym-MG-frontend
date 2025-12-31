import axiosInstance from '../axiosConfig';
import { convertPageResponse, PaginatedResponse, SpringPage } from '../../utils/pagination';
import { Customer, CustomerRequest, CustomerListParams } from '../../types/api/customer';

export const managerCustomersApi = {
  getCustomers: (storeId: string, params?: CustomerListParams): Promise<PaginatedResponse<Customer>> => {
    const query = new URLSearchParams();
    if (params?.page !== undefined) query.append('page', String(params.page));
    if (params?.size !== undefined) query.append('size', String(params.size));
    if (params?.name) query.append('name', params.name);
    if (params?.kana) query.append('kana', params.kana);
    if (params?.isActive !== undefined) query.append('isActive', String(params.isActive));
    return axiosInstance.get<SpringPage<Customer>>(`/stores/${storeId}/manager/customers?${query}`)
      .then(res => convertPageResponse(res.data));
  },

  getCustomer: (storeId: string, customerId: string): Promise<Customer> =>
    axiosInstance.get<Customer>(`/stores/${storeId}/manager/customers/${customerId}`).then(res => res.data),

  createCustomer: (storeId: string, customerData: CustomerRequest): Promise<Customer> =>
    axiosInstance.post<Customer>(`/stores/${storeId}/manager/customers`, customerData).then(res => res.data),

  updateCustomer: (storeId: string, customerId: string, customerData: CustomerRequest): Promise<Customer> =>
    axiosInstance.patch<Customer>(`/stores/${storeId}/manager/customers/${customerId}`, customerData).then(res => res.data),

  // 有効無効切り替えは編集モーダル内(update)でしか行わないため、コメントアウト
  // enableCustomer: (storeId: string, customerId: string): Promise<Customer> =>
  //   axiosInstance.patch<Customer>(`/stores/${storeId}/manager/customers/${customerId}/enable`).then(res => res.data),

  // disableCustomer: (storeId: string, customerId: string): Promise<Customer> =>
  //   axiosInstance.patch<Customer>(`/stores/${storeId}/manager/customers/${customerId}/disable`).then(res => res.data),

  deleteCustomer: (storeId: string, customerId: string): Promise<void> =>
    axiosInstance.delete<void>(`/stores/${storeId}/manager/customers/${customerId}`).then(res => res.data),
};