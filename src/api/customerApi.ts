import { requireSupabase } from '../lib/supabaseHelpers';
import { Customer, CustomerFormData } from '../types/customer';
import { PaginatedResponse, PaginationParams } from '../types/common';
import { isCustomer, isCustomerArray } from '../utils/typeGuards';
import { handleSupabaseError, logError } from '../utils/errorHandler';
import { DEFAULT_PAGE, DEFAULT_PAGE_LIMIT } from '../constants/pagination';

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
    const client = requireSupabase();
    const page = params?.page ?? DEFAULT_PAGE;
    const limit = params?.limit ?? DEFAULT_PAGE_LIMIT;
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const { data, error, count } = await client
      .from('customers')
      .select('*', { count: 'exact' })
      .range(from, to);
    if (error) {
      const appError = handleSupabaseError(error);
      logError(appError, 'customerApi.getAll');
      throw appError;
    }
    const customers = isCustomerArray(data) ? data : [];
    return {
      data: customers,
      total: count ?? customers.length,
      page,
      limit,
    };
  },

  /**
   * Get customer by ID
   * 
   * @param id - Customer ID
   * @returns Customer data
   */
  getById: async (id: string): Promise<Customer> => {
    const client = requireSupabase();
    const { data, error } = await client.from('customers').select('*').eq('id', id).single();
    if (error) {
      const appError = handleSupabaseError(error);
      logError(appError, 'customerApi.getById');
      throw appError;
    }
    if (!isCustomer(data)) {
      throw new Error('Invalid customer data format');
    }
    return data;
  },

  /**
   * Create a new customer
   * 
   * @param data - Customer form data
   * @returns Created customer
   */
  create: async (data: CustomerFormData): Promise<Customer> => {
    const client = requireSupabase();
    const { data: inserted, error } = await client.from('customers').insert([data]).select().single();
    if (error) {
      const appError = handleSupabaseError(error);
      logError(appError, 'customerApi.create');
      throw appError;
    }
    if (!isCustomer(inserted)) {
      throw new Error('Invalid customer data format');
    }
    return inserted;
  },

  /**
   * Update customer by ID
   * 
   * @param id - Customer ID
   * @param data - Partial customer form data
   * @returns Updated customer
   */
  update: async (id: string, data: Partial<CustomerFormData>): Promise<Customer> => {
    const client = requireSupabase();
    const { data: updated, error } = await client
      .from('customers')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) {
      const appError = handleSupabaseError(error);
      logError(appError, 'customerApi.update');
      throw appError;
    }
    if (!isCustomer(updated)) {
      throw new Error('Invalid customer data format');
    }
    return updated;
  },

  /**
   * Delete customer by ID
   * 
   * @param id - Customer ID
   */
  delete: async (id: string): Promise<void> => {
    const client = requireSupabase();
    const { error } = await client.from('customers').delete().eq('id', id);
    if (error) {
      const appError = handleSupabaseError(error);
      logError(appError, 'customerApi.delete');
      throw appError;
    }
  },
};

