import { requireSupabase } from '../lib/supabaseHelpers';
import { User, UserFormData } from '../types/user';
import { PaginatedResponse, PaginationParams } from '../types/common';
import { isUser, isUserArray } from '../utils/typeGuards';
import { handleSupabaseError, logError } from '../utils/errorHandler';
import { DEFAULT_PAGE, DEFAULT_PAGE_LIMIT } from '../constants/pagination';

export const userApi = {
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<User>> => {
    const client = requireSupabase();
    const page = params?.page ?? DEFAULT_PAGE;
    const limit = params?.limit ?? DEFAULT_PAGE_LIMIT;
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const { data, error, count } = await client
      .from('users')
      .select('*', { count: 'exact' })
      .range(from, to);
    if (error) {
      const appError = handleSupabaseError(error);
      logError(appError, 'userApi.getAll');
      throw appError;
    }
    const users = isUserArray(data) ? data : [];
    return {
      data: users,
      total: count ?? users.length,
      page,
      limit,
    };
  },

  getById: async (id: string): Promise<User> => {
    const client = requireSupabase();
    const { data, error } = await client.from('users').select('*').eq('id', id).single();
    if (error) {
      const appError = handleSupabaseError(error);
      logError(appError, 'userApi.getById');
      throw appError;
    }
    if (!isUser(data)) {
      throw new Error('Invalid user data format');
    }
    return data;
  },

  create: async (data: UserFormData): Promise<User> => {
    const client = requireSupabase();
    const { data: inserted, error } = await client.from('users').insert([data]).select().single();
    if (error) {
      const appError = handleSupabaseError(error);
      logError(appError, 'userApi.create');
      throw appError;
    }
    if (!isUser(inserted)) {
      throw new Error('Invalid user data format');
    }
    return inserted;
  },

  update: async (id: string, data: Partial<UserFormData>): Promise<User> => {
    const client = requireSupabase();
    const { data: updated, error } = await client
      .from('users')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) {
      const appError = handleSupabaseError(error);
      logError(appError, 'userApi.update');
      throw appError;
    }
    if (!isUser(updated)) {
      throw new Error('Invalid user data format');
    }
    return updated;
  },

  delete: async (id: string): Promise<void> => {
    const client = requireSupabase();
    const { error } = await client.from('users').delete().eq('id', id);
    if (error) {
      const appError = handleSupabaseError(error);
      logError(appError, 'userApi.delete');
      throw appError;
    }
  },
};

