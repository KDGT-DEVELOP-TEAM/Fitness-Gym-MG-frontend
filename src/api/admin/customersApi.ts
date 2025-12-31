import axiosInstance from '../axiosConfig';
import { convertPageResponse, PaginatedResponse, SpringPage } from '../../utils/pagination';
import { Customer, CustomerRequest, CustomerListParams } from '../../types/api/customer';

export const adminCustomersApi = {
  getCustomers: (params?: CustomerListParams): Promise<PaginatedResponse<Customer>> => {
    const query = new URLSearchParams();
    if (params?.page !== undefined) query.append('page', String(params.page));
    if (params?.size !== undefined) query.append('size', String(params.size));
    if (params?.name) query.append('name', params.name);
    if (params?.kana) query.append('kana', params.kana);
    if (params?.isActive !== undefined) query.append('isActive', String(params.isActive));
    
    return axiosInstance.get<SpringPage<Customer>>(`/admin/customers?${query}`)
      .then(res => convertPageResponse(res.data));
  },

  getCustomer: (customerId: string): Promise<Customer> =>
    axiosInstance.get<Customer>(`/admin/customers/${customerId}`).then(res => res.data),

  createCustomer: (customerData: CustomerRequest): Promise<Customer> =>
    axiosInstance.post<Customer>('/admin/customers', customerData).then(res => res.data),

  updateCustomer: (customerId: string, customerData: CustomerRequest): Promise<Customer> =>
    axiosInstance.patch<Customer>(`/admin/customers/${customerId}`, customerData).then(res => res.data),
  
  // 有効無効切り替えは編集モーダル内(update)でしか行わないため、コメントアウト
  // enableCustomer: (customerId: string): Promise<Customer> =>
  //   axiosInstance.patch<Customer>(`/admin/customers/${customerId}/enable`).then(res => res.data),

  // disableCustomer: (customerId: string): Promise<Customer> =>
  //   axiosInstance.patch<Customer>(`/admin/customers/${customerId}/disable`).then(res => res.data),

  deleteCustomer: (customerId: string): Promise<void> =>
    axiosInstance.delete<void>(`/admin/customers/${customerId}`).then(() => undefined),
};