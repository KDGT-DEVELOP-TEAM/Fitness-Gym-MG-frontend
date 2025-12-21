import axiosInstance from './axiosConfig';
import { User, UserFormData } from '../types/user';
import { PaginatedResponse, PaginationParams } from '../types/common';
import { isUser, isUserArray } from '../utils/typeGuards';
import { handleApiError, logError } from '../utils/errorHandler';
import { DEFAULT_PAGE, DEFAULT_PAGE_LIMIT } from '../constants/pagination';

/**
 * Map API response to User type
 * Handles both camelCase and snake_case responses
 */
const mapUser = (row: User | any): User => {
  // If already in correct format, return as is
  if (row.id && row.email && row.name && row.createdAt) {
    return row as User;
  }
  
  // Map from snake_case if needed
  return {
    id: row.id,
    email: row.email ?? '',
    name: row.name ?? '',
    role: (row.role as User['role']) ?? 'trainer',
    createdAt: row.created_at ?? row.createdAt ?? new Date().toISOString(), // DBでNOT NULL
  };
};

/**
 * User API
 * Handles CRUD operations for users
 */
export const userApi = {
  /**
   * Get all users with pagination
   * 
   * @param params - Pagination parameters (page, limit)
   * @returns Paginated response containing users
   */
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<User>> => {
    try {
      const page = params?.page ?? DEFAULT_PAGE;
      const limit = params?.limit ?? DEFAULT_PAGE_LIMIT;
      
      const response = await axiosInstance.get<PaginatedResponse<User>>('/users', {
        params: { page, limit },
      });
      
      if (!response.data || !Array.isArray(response.data.data)) {
        throw new Error('Invalid response format from /users');
      }
      
      const mapped = response.data.data.map(mapUser).filter(isUser);
      return {
        data: mapped,
        total: response.data.total ?? mapped.length,
        page: response.data.page ?? page,
        limit: response.data.limit ?? limit,
      };
    } catch (error) {
      const appError = handleApiError(error);
      logError(appError, 'userApi.getAll');
      throw appError;
    }
  },

  /**
   * Get user by ID
   * 
   * @param id - User ID
   * @returns User data
   */
  getById: async (id: string): Promise<User> => {
    try {
      const response = await axiosInstance.get<User>(`/users/${id}`);
      const user = mapUser(response.data);
      if (!isUser(user)) {
        throw new Error('Invalid user data format');
      }
      return user;
    } catch (error) {
      const appError = handleApiError(error);
      logError(appError, 'userApi.getById');
      throw appError;
    }
  },

  /**
   * Create a new user
   * 
   * @param data - User form data
   * @returns Created user
   */
  create: async (data: UserFormData): Promise<User> => {
    try {
      const response = await axiosInstance.post<User>('/users', data);
      const user = mapUser(response.data);
      if (!isUser(user)) {
        throw new Error('Invalid user data format');
      }
      return user;
    } catch (error) {
      const appError = handleApiError(error);
      logError(appError, 'userApi.create');
      throw appError;
    }
  },

  /**
   * Update user by ID
   * 
   * @param id - User ID
   * @param data - Partial user form data
   * @returns Updated user
   */
  update: async (id: string, data: Partial<UserFormData>): Promise<User> => {
    try {
      const response = await axiosInstance.put<User>(`/users/${id}`, data);
      const user = mapUser(response.data);
      if (!isUser(user)) {
        throw new Error('Invalid user data format');
      }
      return user;
    } catch (error) {
      const appError = handleApiError(error);
      logError(appError, 'userApi.update');
      throw appError;
    }
  },

  /**
   * Delete user by ID
   * 
   * @param id - User ID
   */
  delete: async (id: string): Promise<void> => {
    try {
      await axiosInstance.delete(`/users/${id}`);
    } catch (error) {
      const appError = handleApiError(error);
      logError(appError, 'userApi.delete');
      throw appError;
    }
  },
};
