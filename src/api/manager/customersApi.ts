import axiosInstance from '../axiosConfig';
import { convertPageResponse, PaginatedResponse, SpringPage } from '../../utils/pagination';
import { Customer } from '../../types/customer';

// export interface Customer {
//   id: string;
//   name: string;
//   email: string;
//   phone: string;
//   shopId: string;
//   createdAt: string;
// }

export interface CustomerListParams {
  page?: number;
  size?: number;
  name?: string;
  kana?: string;
  active?: boolean;
}

export const managerCustomersApi = {
  getCustomers: (storeId: string, params?: CustomerListParams): Promise<PaginatedResponse<Customer>> => {
    const queryString = new URLSearchParams(params as any).toString();
    return axiosInstance.get<SpringPage<Customer>>(`/api/stores/${storeId}/manager/customers?${queryString}`)
      .then(res => convertPageResponse(res.data));
  },

  getCustomer: (storeId: string, customerId: string): Promise<Customer> =>
    axiosInstance.get<Customer>(`/api/stores/${storeId}/manager/customers/${customerId}`).then(res => res.data),

  createCustomer: (storeId: string, customerData: any): Promise<Customer> =>
    axiosInstance.post<Customer>(`/api/stores/${storeId}/manager/customers`, customerData).then(res => res.data),

  updateCustomer: (storeId: string, customerId: string, customerData: any): Promise<Customer> =>
    axiosInstance.patch<Customer>(`/api/stores/${storeId}/manager/customers/${customerId}`, customerData).then(res => res.data),

  // 有効無効切り替えは編集モーダル内(update)でしか行わないため、コメントアウト
  // enableCustomer: (storeId: string, customerId: string): Promise<Customer> =>
  //   axiosInstance.patch<Customer>(`/api/stores/${storeId}/manager/customers/${customerId}/enable`).then(res => res.data),

  // disableCustomer: (storeId: string, customerId: string): Promise<Customer> =>
  //   axiosInstance.patch<Customer>(`/api/stores/${storeId}/manager/customers/${customerId}/disable`).then(res => res.data),

  deleteCustomer: (storeId: string, customerId: string): Promise<void> =>
    axiosInstance.delete<void>(`/api/stores/${storeId}/manager/customers/${customerId}`).then(res => res.data),
};