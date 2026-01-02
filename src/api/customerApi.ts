import axiosInstance from './axiosConfig';
import { Customer,VitalRecord,VitalsHistory } from '../types/api/customer';
import { CustomerFormData } from '../types/form/customer'
import { PaginatedResponse, PaginationParams } from '../types/common';

export const customerApi = {
  getProfile: (customerId: string): Promise<Customer> =>
    axiosInstance.get<Customer>(`/customers/${customerId}/profile`).then(res => res.data),

  updateProfile: (customerId: string, profileData: VitalRecord): Promise<Customer> =>
    axiosInstance.patch<Customer>(`/customers/${customerId}/profile`, profileData).then(res => res.data),

  getVitalsHistory: (customerId: string): Promise<VitalsHistory> =>
    axiosInstance.get<VitalsHistory>(`/customers/${customerId}/vitals/history`).then(res => res.data),

  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<Customer>> => {
    const response = await axiosInstance.get<PaginatedResponse<Customer>>('/customers', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Customer> => {
    const response = await axiosInstance.get<Customer>(`/customers/${id}`);
    return response.data;
  },

  create: async (data: CustomerFormData): Promise<Customer> => {
    const response = await axiosInstance.post<Customer>('/customers', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CustomerFormData>): Promise<Customer> => {
    const response = await axiosInstance.put<Customer>(`/customers/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/customers/${id}`);
  },
};