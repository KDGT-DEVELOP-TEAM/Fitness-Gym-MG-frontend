import axiosInstance from './axiosConfig';
import { Customer } from '../types/customer';

export interface VitalsHistory {
  // バイタル履歴の型定義
  [key: string]: any;
}

export const customerApi = {
  getProfile: (customerId: string): Promise<Customer> =>
    axiosInstance.get<Customer>(`/api/customers/${customerId}/profile`).then(res => res.data),

  updateProfile: (customerId: string, profileData: any): Promise<Customer> =>
    axiosInstance.patch<Customer>(`/api/customers/${customerId}/profile`, profileData).then(res => res.data),

  getVitalsHistory: (customerId: string): Promise<VitalsHistory> =>
    axiosInstance.get<VitalsHistory>(`/api/customers/${customerId}/vitals/history`).then(res => res.data),
};