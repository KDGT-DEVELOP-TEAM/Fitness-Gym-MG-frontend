import axiosInstance from './axiosConfig';
import { Customer, CustomerRequest, VitalsHistory } from '../types/api/customer';

export const customerApi = {
  /**
   * 顧客プロフィール取得
   * GET /api/customers/{customer_id}/profile
   */
  getProfile: (customerId: string): Promise<Customer> =>
    axiosInstance.get<Customer>(`/customers/${customerId}/profile`).then(res => res.data),

  /**
   * 顧客プロフィール更新
   * PATCH /api/customers/{customer_id}/profile
   * バックエンドはCustomerRequestを期待
   */
  updateProfile: (customerId: string, profileData: CustomerRequest): Promise<void> =>
    axiosInstance.patch<void>(`/customers/${customerId}/profile`, profileData).then(() => undefined),

  /**
   * 体重/BMI履歴取得
   * GET /api/customers/{customer_id}/vitals/history
   */
  getVitalsHistory: (customerId: string): Promise<VitalsHistory> =>
    axiosInstance.get<VitalsHistory>(`/customers/${customerId}/vitals/history`).then(res => res.data),
};
