import axiosInstance from './axiosConfig';
import { Customer,VitalRecord,VitalsHistory } from '../types/customer';

export const customerApi = {
  getProfile: (customerId: string): Promise<Customer> =>
    axiosInstance.get<Customer>(`/customers/${customerId}/profile`).then(res => res.data),

  updateProfile: (customerId: string, profileData: VitalRecord): Promise<Customer> =>
    axiosInstance.patch<Customer>(`/customers/${customerId}/profile`, profileData).then(res => res.data),

  getVitalsHistory: (customerId: string): Promise<VitalsHistory> =>
    axiosInstance.get<VitalsHistory>(`/customers/${customerId}/vitals/history`).then(res => res.data),
};