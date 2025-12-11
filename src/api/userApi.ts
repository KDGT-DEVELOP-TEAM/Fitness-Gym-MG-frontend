import { supabase } from '../lib/supabase';
import { User, UserFormData } from '../types/user';
import { PaginatedResponse, PaginationParams } from '../types/common';

export const userApi = {
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<User>> => {
    if (!supabase) throw new Error('Supabase未設定');
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 100;
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const { data, error, count } = await supabase
      .from('users')
      .select('*', { count: 'exact' })
      .range(from, to);
    if (error) throw error;
    return {
      data: (data as User[]) ?? [],
      total: count ?? data?.length ?? 0,
      page,
      limit,
    };
  },

  getById: async (id: string): Promise<User> => {
    if (!supabase) throw new Error('Supabase未設定');
    const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
    if (error) throw error;
    return data as User;
  },

  create: async (data: UserFormData): Promise<User> => {
    if (!supabase) throw new Error('Supabase未設定');
    const { data: inserted, error } = await supabase.from('users').insert([data]).select().single();
    if (error) throw error;
    return inserted as User;
  },

  update: async (id: string, data: Partial<UserFormData>): Promise<User> => {
    if (!supabase) throw new Error('Supabase未設定');
    const { data: updated, error } = await supabase
      .from('users')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return updated as User;
  },

  delete: async (id: string): Promise<void> => {
    if (!supabase) throw new Error('Supabase未設定');
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) throw error;
  },
};

