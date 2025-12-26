import axiosInstance from '../axiosConfig';
import { convertPageResponse, PaginatedResponse, SpringPage } from '../../utils/pagination';
import { Customer } from '../../types/customer';

export interface CustomerListParams {
  page?: number;
  size?: number;
  name?: string;
  kana?: string;
  active?: boolean;
}

// export interface Customer {
//   id: string;
//   name: string;
//   email: string;
//   phone: string;
//   shopId: string;
//   createdAt: string;
// }

export const adminCustomersApi = {
  getCustomers: (params?: CustomerListParams): Promise<PaginatedResponse<Customer>> => {
    const queryString = new URLSearchParams(params as any).toString();
    return axiosInstance.get<SpringPage<Customer>>(`/api/admin/customers?${queryString}`)
      .then(res => convertPageResponse(res.data));
  },

  getCustomer: (customerId: string): Promise<Customer> =>
    axiosInstance.get<Customer>(`/api/admin/customers/${customerId}`).then(res => res.data),

  createCustomer: (customerData: any): Promise<Customer> =>
    axiosInstance.post<Customer>('/api/admin/customers', customerData).then(res => res.data),

  updateCustomer: (customerId: string, customerData: any): Promise<Customer> =>
    axiosInstance.patch<Customer>(`/api/admin/customers/${customerId}`, customerData).then(res => res.data),

  // 有効無効切り替えは編集モーダル内(update)でしか行わないため、コメントアウト
  // enableCustomer: (customerId: string): Promise<Customer> =>
  //   axiosInstance.patch<Customer>(`/api/admin/customers/${customerId}/enable`).then(res => res.data),

  // disableCustomer: (customerId: string): Promise<Customer> =>
  //   axiosInstance.patch<Customer>(`/api/admin/customers/${customerId}/disable`).then(res => res.data),

  deleteCustomer: (customerId: string): Promise<void> =>
    axiosInstance.delete<void>(`/api/admin/customers/${customerId}`).then(res => res.data),
};