/**
 * Secure storage utilities using sessionStorage
 * sessionStorage is cleared when the browser tab is closed
 * JWT認証用にトークン管理機能を提供
 */

import { logger } from './logger';

const USER_KEY = 'user';
const TOKEN_KEY = 'token';

export const storage = {
  /**
   * Store minimal user information (only essential fields)
   */
  setUser: (user: { userId: string; email: string; name: string; role: string }): void => {
    try {
      // Store only essential user information, exclude sensitive data
      const minimalUser = {
        userId: user.userId,
        email: user.email,
        name: user.name,
        role: user.role,
      };
      sessionStorage.setItem(USER_KEY, JSON.stringify(minimalUser));
    } catch (error) {
      logger.error('Failed to store user', error, 'storage');
      throw new Error('Failed to store user information');
    }
  },

  /**
   * Get stored user information
   * 不正なデータや型が一致しない場合はnullを返し、ストレージをクリア
   */
  getUser: (): { userId: string; email: string; name: string; role: string } | null => {
    try {
      const userStr = sessionStorage.getItem(USER_KEY);
      if (!userStr) return null;

      // JSON.parseを実行
      const parsed = JSON.parse(userStr);

      // 型チェック: 必須フィールドが存在し、正しい型であることを確認
      if (
        typeof parsed !== 'object' ||
        parsed === null ||
        typeof parsed.userId !== 'string' ||
        typeof parsed.email !== 'string' ||
        typeof parsed.name !== 'string' ||
        typeof parsed.role !== 'string'
      ) {
        logger.warn('Invalid user data format in storage, clearing', { parsed }, 'storage');
        storage.clear();
        return null;
      }

      // 必須フィールドが空でないことを確認
      if (!parsed.userId || !parsed.email || !parsed.name || !parsed.role) {
        logger.warn('User data has empty required fields, clearing', { parsed }, 'storage');
        storage.clear();
        return null;
      }

      return parsed;
    } catch (error) {
      logger.error('Failed to retrieve user (JSON parse error)', error, 'storage');
      // 不正なデータが存在する可能性があるため、ストレージをクリア
      storage.clear();
      return null;
    }
  },

  /**
   * Store JWT token
   */
  setToken: (token: string): void => {
    try {
      sessionStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
      logger.error('Failed to store token', error, 'storage');
      throw new Error('Failed to store token');
    }
  },

  /**
   * Get stored JWT token
   */
  getToken: (): string | null => {
    try {
      return sessionStorage.getItem(TOKEN_KEY);
    } catch (error) {
      logger.error('Failed to retrieve token', error, 'storage');
      return null;
    }
  },

  /**
   * Remove JWT token
   */
  removeToken: (): void => {
    try {
      sessionStorage.removeItem(TOKEN_KEY);
    } catch (error) {
      logger.error('Failed to remove token', error, 'storage');
    }
  },

  /**
   * Remove user data
   */
  removeUser: (): void => {
    try {
      sessionStorage.removeItem(USER_KEY);
    } catch (error) {
      logger.error('Failed to remove user', error, 'storage');
    }
  },

  /**
   * Clear all authentication data
   */
  clear: (): void => {
    try {
      storage.removeToken();
      storage.removeUser();
    } catch (error) {
      logger.error('Failed to clear storage', error, 'storage');
    }
  },
};
