import axiosInstance from '../axiosConfig';
import { convertPageResponse, PaginatedResponse, SpringPage } from '../../utils/pagination';
import { Customer, CustomerRequest, CustomerListParams } from '../../types/api/customer';

export const adminCustomersApi = {
  getCustomers: (params?: CustomerListParams): Promise<PaginatedResponse<Customer>> => {
    const query = new URLSearchParams();
    if (params?.page !== undefined) query.append('page', String(params.page));
    if (params?.size !== undefined) query.append('size', String(params.size));
    if (params?.name) query.append('name', params.name);
    if (params?.sort) query.append('sort', params.sort);
    if (params?.storeId) query.append('storeId', params.storeId);
    // バックエンドが受け取らないパラメータを削除:
    // kana: バックエンドのCustomerApiControllerでは受け取らない
    // isActive: バックエンドのCustomerApiControllerでは受け取らない
    
    return axiosInstance.get<SpringPage<Customer>>(`/admin/customers?${query}`)
      .then(res => convertPageResponse(res.data));
  },

  createCustomer: (customerData: CustomerRequest): Promise<void> =>
    axiosInstance.post<void>('/admin/customers', customerData).then(() => undefined),
  
  // 有効無効切り替えは編集モーダル内(update)でしか行わないため、コメントアウト
  // enableCustomer: (customerId: string): Promise<Customer> =>
  //   axiosInstance.patch<Customer>(`/admin/customers/${customerId}/enable`).then(res => res.data),

  // disableCustomer: (customerId: string): Promise<Customer> =>
  //   axiosInstance.patch<Customer>(`/admin/customers/${customerId}/disable`).then(res => res.data),

  deleteCustomer: (customerId: string): Promise<void> =>
    axiosInstance.delete<void>(`/admin/customers/${customerId}`).then(() => undefined),
};