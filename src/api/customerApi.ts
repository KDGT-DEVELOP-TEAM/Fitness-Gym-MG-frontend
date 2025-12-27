import axiosInstance from './axiosConfig';
import { Customer } from '../types/customer';

export const customerApi = {
  getProfile: (customerId: string) =>
    axiosInstance.get(`/api/customers/${customerId}/profile`).then(res => res.data),

  updateProfile: (customerId: string, profileData: any) =>
    axiosInstance.patch(`/api/customers/${customerId}/profile`, profileData).then(res => res.data),

  getVitalsHistory: (customerId: string) =>
    axiosInstance.get(`/api/customers/${customerId}/vitals/history`).then(res => res.data),
};
