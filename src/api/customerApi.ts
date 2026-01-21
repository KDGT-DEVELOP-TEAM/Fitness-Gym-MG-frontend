import axiosInstance from './axiosConfig';
import { Customer, CustomerRequest, VitalsHistory } from '../types/api/customer';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

export const customerApi = {
  /**
   * 顧客プロフィール取得
   * GET /api/customers/{customer_id}/profile
   */
  getProfile: (customerId: string): Promise<Customer> =>
    axiosInstance.get<Customer>(`${API_ENDPOINTS.CUSTOMERS.BY_ID(customerId)}/profile`).then(res => res.data),

  /**
   * 顧客プロフィール更新
   * PATCH /api/customers/{customer_id}/profile
   * バックエンドはCustomerRequestを期待
   */
  updateProfile: (customerId: string, profileData: CustomerRequest): Promise<void> =>
    axiosInstance.patch<void>(`${API_ENDPOINTS.CUSTOMERS.BY_ID(customerId)}/profile`, profileData).then(() => undefined),

  /**
   * 体重/BMI履歴取得
   * GET /api/customers/{customer_id}/vitals/history
   */
  getVitalsHistory: (customerId: string): Promise<VitalsHistory> =>
    axiosInstance.get<VitalsHistory>(`${API_ENDPOINTS.CUSTOMERS.BY_ID(customerId)}/vitals/history`).then(res => res.data),
};
