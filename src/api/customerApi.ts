import { supabase } from '../lib/supabase';
import { Customer, CustomerFormData } from '../types/customer';
import { PaginatedResponse, PaginationParams } from '../types/common';

export const customerApi = {
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<Customer>> => {
    if (!supabase) throw new Error('Supabase未設定');
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 100;
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const { data, error, count } = await supabase
      .from('customers')
      .select('*', { count: 'exact' })
      .range(from, to);
    if (error) throw error;
    return {
      data: (data as Customer[]) ?? [],
      total: count ?? data?.length ?? 0,
      page,
      limit,
    };
  },

  getById: async (id: string): Promise<Customer> => {
    if (!supabase) throw new Error('Supabase未設定');
    const { data, error } = await supabase.from('customers').select('*').eq('id', id).single();
    if (error) throw error;
    return data as Customer;
  },

  create: async (data: CustomerFormData): Promise<Customer> => {
    if (!supabase) throw new Error('Supabase未設定');
    const { data: inserted, error } = await supabase.from('customers').insert([data]).select().single();
    if (error) throw error;
    return inserted as Customer;
  },

  update: async (id: string, data: Partial<CustomerFormData>): Promise<Customer> => {
    if (!supabase) throw new Error('Supabase未設定');
    const { data: updated, error } = await supabase
      .from('customers')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return updated as Customer;
  },

  delete: async (id: string): Promise<void> => {
    if (!supabase) throw new Error('Supabase未設定');
    const { error } = await supabase.from('customers').delete().eq('id', id);
    if (error) throw error;
  },
};

