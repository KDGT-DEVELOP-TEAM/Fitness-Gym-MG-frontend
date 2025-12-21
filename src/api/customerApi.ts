import axiosInstance from './axiosConfig';
import { Customer, CustomerFormData } from '../types/customer';
import { PaginatedResponse, PaginationParams } from '../types/common';
import { isCustomer, isCustomerArray } from '../utils/typeGuards';
import { handleApiError, logError } from '../utils/errorHandler';
import { DEFAULT_PAGE, DEFAULT_PAGE_LIMIT } from '../constants/pagination';

/**
 * Map API response to Customer type
 * Handles both camelCase and snake_case responses
 */
const mapCustomer = (row: Customer | any): Customer => {
  // If already in correct format, return as is
  if (row.id && row.name && row.email && row.phone && row.createdAt) {
    return row as Customer;
  }
  
  // Map from snake_case if needed
  return {
    id: row.id,
    name: row.name ?? '',
    email: row.email ?? '', // DBでNOT NULL
    phone: row.phone ?? '', // DBでNOT NULL
    shopId: row.shop_id ?? row.shopId ?? '',
    createdAt: row.created_at ?? row.createdAt ?? new Date().toISOString(), // DBでNOT NULL
  };
};

/**
 * Customer API
 * Handles CRUD operations for customers
 */
export const customerApi = {
  /**
   * Get all customers with pagination
   * 
   * @param params - Pagination parameters (page, limit)
   * @returns Paginated response containing customers
   */
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<Customer>> => {
    try {
      const page = params?.page ?? DEFAULT_PAGE;
      const limit = params?.limit ?? DEFAULT_PAGE_LIMIT;
      
      const response = await axiosInstance.get<PaginatedResponse<Customer>>('/customers', {
        params: { page, limit },
      });
      
      if (!response.data || !Array.isArray(response.data.data)) {
        throw new Error('Invalid response format from /customers');
      }
      
      const mapped = response.data.data.map(mapCustomer).filter(isCustomer);
      return {
        data: mapped,
        total: response.data.total ?? mapped.length,
        page: response.data.page ?? page,
        limit: response.data.limit ?? limit,
      };
    } catch (error) {
      const appError = handleApiError(error);
      logError(appError, 'customerApi.getAll');
      throw appError;
    }
  },

  /**
   * Get customer by ID
   * 
   * @param id - Customer ID
   * @returns Customer data
   */
  getById: async (id: string): Promise<Customer> => {
    try {
      const response = await axiosInstance.get<Customer>(`/customers/${id}`);
      const customer = mapCustomer(response.data);
      if (!isCustomer(customer)) {
        throw new Error('Invalid customer data format');
      }
      return customer;
    } catch (error) {
      const appError = handleApiError(error);
      logError(appError, 'customerApi.getById');
      throw appError;
    }
  },

  /**
   * Create a new customer
   * 
   * @param data - Customer form data
   * @returns Created customer
   */
  create: async (data: CustomerFormData): Promise<Customer> => {
    try {
      const response = await axiosInstance.post<Customer>('/customers', data);
      const customer = mapCustomer(response.data);
      if (!isCustomer(customer)) {
        throw new Error('Invalid customer data format');
      }
      return customer;
    } catch (error) {
      const appError = handleApiError(error);
      logError(appError, 'customerApi.create');
      throw appError;
    }
  },

  /**
   * Update customer by ID
   * 
   * @param id - Customer ID
   * @param data - Partial customer form data
   * @returns Updated customer
   */
  update: async (id: string, data: Partial<CustomerFormData>): Promise<Customer> => {
    try {
      const response = await axiosInstance.put<Customer>(`/customers/${id}`, data);
      const customer = mapCustomer(response.data);
      if (!isCustomer(customer)) {
        throw new Error('Invalid customer data format');
      }
      return customer;
    } catch (error) {
      const appError = handleApiError(error);
      logError(appError, 'customerApi.update');
      throw appError;
    }
  },

  /**
   * Delete customer by ID
   * 
   * @param id - Customer ID
   */
  delete: async (id: string): Promise<void> => {
    try {
      await axiosInstance.delete(`/customers/${id}`);
    } catch (error) {
      const appError = handleApiError(error);
      logError(appError, 'customerApi.delete');
      throw appError;
    }
  },
};
