import axiosInstance from './axiosConfig';
import { Posture, PostureComparison } from '../types/posture';
import { PaginatedResponse, PaginationParams } from '../types/common';
import { isPosture, isPostureArray, isPostureComparison } from '../utils/typeGuards';
import { handleApiError, logError } from '../utils/errorHandler';

/**
 * Posture API
 * Handles CRUD operations for postures
 */
export const postureApi = {
  /**
   * Get all postures with pagination
   * 
   * @param params - Pagination parameters (page, limit)
   * @returns Paginated response containing postures
   */
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<Posture>> => {
    try {
      const response = await axiosInstance.get<PaginatedResponse<Posture>>('/postures', { params });
      if (!response.data || !Array.isArray(response.data.data)) {
        throw new Error('Invalid response format from /postures');
      }
      const validPostures = response.data.data.filter(isPosture);
      return {
        ...response.data,
        data: validPostures,
      };
    } catch (error) {
      const appError = handleApiError(error);
      logError(appError, 'postureApi.getAll');
      throw appError;
    }
  },

  /**
   * Get posture by ID
   * 
   * @param id - Posture ID
   * @returns Posture data
   */
  getById: async (id: string): Promise<Posture> => {
    try {
      const response = await axiosInstance.get<Posture>(`/postures/${id}`);
      if (!isPosture(response.data)) {
        throw new Error('Invalid posture data format');
      }
      return response.data;
    } catch (error) {
      const appError = handleApiError(error);
      logError(appError, 'postureApi.getById');
      throw appError;
    }
  },

  /**
   * Get postures by customer ID
   * 
   * @param customerId - Customer ID
   * @returns Array of postures
   */
  getByCustomerId: async (customerId: string): Promise<Posture[]> => {
    try {
      const response = await axiosInstance.get<Posture[]>(`/postures/customer/${customerId}`);
      if (!Array.isArray(response.data)) {
        throw new Error('Invalid response format from /postures/customer');
      }
      return response.data.filter(isPosture);
    } catch (error) {
      const appError = handleApiError(error);
      logError(appError, 'postureApi.getByCustomerId');
      throw appError;
    }
  },

  /**
   * Create a new posture
   * 
   * @param formData - Form data containing posture information
   * @returns Created posture
   */
  create: async (formData: FormData): Promise<Posture> => {
    try {
      const response = await axiosInstance.post<Posture>('/postures', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (!isPosture(response.data)) {
        throw new Error('Invalid posture data format');
      }
      return response.data;
    } catch (error) {
      const appError = handleApiError(error);
      logError(appError, 'postureApi.create');
      throw appError;
    }
  },

  /**
   * Compare two postures
   * 
   * @param beforeId - Before posture ID
   * @param afterId - After posture ID
   * @returns Posture comparison data
   */
  compare: async (beforeId: string, afterId: string): Promise<PostureComparison> => {
    try {
      const response = await axiosInstance.post<PostureComparison>('/postures/compare', {
        beforeId,
        afterId,
      });
      if (!isPostureComparison(response.data)) {
        throw new Error('Invalid posture comparison data format');
      }
      return response.data;
    } catch (error) {
      const appError = handleApiError(error);
      logError(appError, 'postureApi.compare');
      throw appError;
    }
  },

  /**
   * Delete posture by ID
   * 
   * @param id - Posture ID
   */
  delete: async (id: string): Promise<void> => {
    try {
      await axiosInstance.delete(`/postures/${id}`);
    } catch (error) {
      const appError = handleApiError(error);
      logError(appError, 'postureApi.delete');
      throw appError;
    }
  },
};

