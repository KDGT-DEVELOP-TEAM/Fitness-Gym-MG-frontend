/**
 * オプションデータ（店舗、ユーザー、顧客）を取得するAPI
 * コードの重複を避けるために一元化
 */

import { apiClient } from './client';
import { logger } from '../utils/logger';

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
    const response = await apiClient.get<StoreResponse[]>('/api/stores');
    
    if (!response || !Array.isArray(response)) {
      logger.warn('Invalid stores data format', { data: response }, 'optionsApi');
      return [];
    }
    
    return response.map((d) => ({ id: d.id, name: d.name }));
  } catch (error) {
    logger.error('Failed to fetch stores', error, 'optionsApi');
    return [];
  }
};

/**
 * すべてのユーザーをオプションとして取得
 */
export const fetchUserOptions = async (): Promise<Option[]> => {
  try {
    const response = await apiClient.get<UserResponse[]>('/api/users');
    
    if (!response || !Array.isArray(response)) {
      logger.warn('Invalid users data format', { data: response }, 'optionsApi');
      return [];
    }
    
    return response.map((d) => ({ id: d.id, name: d.name }));
  } catch (error) {
    logger.error('Failed to fetch users', error, 'optionsApi');
    return [];
  }
};

/**
 * すべての顧客をオプションとして取得
 */
export const fetchCustomerOptions = async (): Promise<Option[]> => {
  try {
    const response = await apiClient.get<CustomerResponse[]>('/api/customers');
    
    if (!response || !Array.isArray(response)) {
      logger.warn('Invalid customers data format', { data: response }, 'optionsApi');
      return [];
    }
    
    return response.map((d) => ({ id: d.id, name: d.name }));
  } catch (error) {
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
