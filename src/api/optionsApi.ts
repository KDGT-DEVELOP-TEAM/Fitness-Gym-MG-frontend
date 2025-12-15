/**
 * オプションデータ（店舗、ユーザー、顧客）を取得するAPI
 * コードの重複を避けるために一元化
 */

import axiosInstance from './axiosConfig';
import { logger } from '../utils/logger';
import { handleApiError, logError } from '../utils/errorHandler';

export type Option = { id: string; name: string };

interface StoreResponse {
  id: string;
  name: string;
}

interface UserResponse {
  id: string;
  name: string;
}

interface CustomerResponse {
  id: string;
  name: string;
}

/**
 * Fetch all stores as options
 */
export const fetchStoreOptions = async (): Promise<Option[]> => {
  try {
    const response = await axiosInstance.get<StoreResponse[]>('/stores');
    
    if (!response.data || !Array.isArray(response.data)) {
      logger.warn('Invalid stores data format', { data: response.data }, 'optionsApi');
      return [];
    }
    
    return response.data.map((d) => ({ id: d.id, name: d.name }));
  } catch (error) {
    const appError = handleApiError(error);
    logError(appError, 'optionsApi.fetchStoreOptions');
    logger.error('Failed to fetch stores', error, 'optionsApi');
    return [];
  }
};

/**
 * すべてのユーザーをオプションとして取得
 */
export const fetchUserOptions = async (): Promise<Option[]> => {
  try {
    const response = await axiosInstance.get<UserResponse[]>('/users');
    
    if (!response.data || !Array.isArray(response.data)) {
      logger.warn('Invalid users data format', { data: response.data }, 'optionsApi');
      return [];
    }
    
    return response.data.map((d) => ({ id: d.id, name: d.name }));
  } catch (error) {
    const appError = handleApiError(error);
    logError(appError, 'optionsApi.fetchUserOptions');
    logger.error('Failed to fetch users', error, 'optionsApi');
    return [];
  }
};

/**
 * すべての顧客をオプションとして取得
 */
export const fetchCustomerOptions = async (): Promise<Option[]> => {
  try {
    const response = await axiosInstance.get<CustomerResponse[]>('/customers');
    
    if (!response.data || !Array.isArray(response.data)) {
      logger.warn('Invalid customers data format', { data: response.data }, 'optionsApi');
      return [];
    }
    
    return response.data.map((d) => ({ id: d.id, name: d.name }));
  } catch (error) {
    const appError = handleApiError(error);
    logError(appError, 'optionsApi.fetchCustomerOptions');
    logger.error('Failed to fetch customers', error, 'optionsApi');
    return [];
  }
};

/**
 * すべてのオプションを一度に取得
 */
export const fetchAllOptions = async (): Promise<{
  stores: Option[];
  users: Option[];
  customers: Option[];
}> => {
  const [stores, users, customers] = await Promise.all([
    fetchStoreOptions(),
    fetchUserOptions(),
    fetchCustomerOptions(),
  ]);

  return { stores, users, customers };
};
