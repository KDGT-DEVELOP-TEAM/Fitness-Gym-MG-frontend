import axiosInstance from './axiosConfig';
import { Customer, CustomerFormData } from '../types/customer';
import { PaginatedResponse, PaginationParams } from '../types/common';

export const customerApi = {
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

