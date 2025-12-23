import { apiClient } from './client';
import { Customer } from '../types/customer';

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export const customerApi = {
  getAll: (params?: PaginationParams): Promise<PaginatedResponse<Customer>> =>
    apiClient.get(`/api/customers?page=${params?.page || 1}&limit=${params?.limit || 10}`),

  getById: (customerId: string): Promise<Customer> =>
    apiClient.get(`/api/customers/${customerId}`),

  getProfile: (customerId: string) =>
    apiClient.get(`/api/customers/${customerId}/profile`),

  updateProfile: (customerId: string, profileData: any) =>
    apiClient.patch(`/api/customers/${customerId}/profile`, profileData),

  getVitalsHistory: (customerId: string) =>
    apiClient.get(`/api/customers/${customerId}/vitals/history`),
};
