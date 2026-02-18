/**
 * オプションデータ（店舗、ユーザー、顧客）を取得するAPI
 * コードの重複を避けるために一元化
 */

import axiosInstance from './axiosConfig';
import { logger } from '../utils/logger';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

export type Option = { id: string; name: string; role?: string };

interface StoreResponse {
  id: string;
  name: string;
}

interface UserResponse {
  id: string;
  name: string;
  role?: string; // オプション: フィルタリング用
}

interface CustomerResponse {
  id: string;
  name: string;
}

/**
 * すべての店舗をオプションとして取得
 * GET /api/stores
 */
export const fetchStoreOptions = async (): Promise<Option[]> => {
  try {
    const response = await axiosInstance.get<StoreResponse[]>(API_ENDPOINTS.STORES.BASE);
    const data = response.data;
    
    if (!data || !Array.isArray(data)) {
      logger.warn('Invalid stores data format', { data }, 'optionsApi');
      return [];
    }
    
    return data.map((d) => ({ id: d.id, name: d.name }));
  } catch (error: unknown) {
    logger.error('Failed to fetch stores', error, 'optionsApi');
    // バックエンドに実装がない場合は空配列を返す
    return [];
  }
};

/**
 * すべてのユーザーをオプションとして取得
 */
export const fetchUserOptions = async (): Promise<Option[]> => {
  try {
    const response = await axiosInstance.get<UserResponse[]>(API_ENDPOINTS.USERS.BASE);
    const data = response.data;
    
    if (!data || !Array.isArray(data)) {
      logger.warn('Invalid users data format', { data }, 'optionsApi');
      return [];
    }
    
    return data.map((d) => ({ id: d.id, name: d.name, role: d.role }));
  } catch (error: unknown) {
    logger.error('Failed to fetch users', error, 'optionsApi');
    return [];
  }
};

/**
 * すべての顧客をオプションとして取得
 */
export const fetchCustomerOptions = async (): Promise<Option[]> => {
  try {
    const response = await axiosInstance.get<CustomerResponse[]>(API_ENDPOINTS.CUSTOMERS.BASE);
    const data = response.data;
    
    if (!data || !Array.isArray(data)) {
      logger.warn('Invalid customers data format', { data }, 'optionsApi');
      return [];
    }
    
    return data.map((d) => ({ id: d.id, name: d.name }));
  } catch (error: unknown) {
    logger.error('Failed to fetch customers', error, 'optionsApi');
    return [];
  }
};

/**
 * グローバルなリクエスト重複排除用
 * 同時に複数のコンポーネントから呼ばれても、1つのリクエストのみ実行
 */
let pendingOptionsRequest: Promise<{
  stores: Option[];
  users: Option[];
  customers: Option[];
}> | null = null;

/**
 * すべてのオプションを一度に取得
 * リクエストの重複を防ぐため、実行中のリクエストがある場合はそれを再利用
 */
export const fetchAllOptions = async (): Promise<{
  stores: Option[];
  users: Option[];
  customers: Option[];
}> => {
  // 既に実行中のリクエストがある場合は、それを返す
  if (pendingOptionsRequest) {
    logger.debug('Reusing pending options request (deduplication)', {}, 'optionsApi');
    return pendingOptionsRequest;
  }

  logger.debug('Starting new options request', {}, 'optionsApi');

  // 新しいリクエストを開始
  pendingOptionsRequest = (async () => {
    try {
      const [stores, users, customers] = await Promise.all([
        fetchStoreOptions(),
        fetchUserOptions(),
        fetchCustomerOptions(),
      ]);

      logger.debug('Options request completed', 
        { storesCount: stores.length, usersCount: users.length, customersCount: customers.length }, 
        'optionsApi');

      return { stores, users, customers };
    } finally {
      // リクエスト完了後、pendingをクリア
      pendingOptionsRequest = null;
    }
  })();

  return pendingOptionsRequest;
};
