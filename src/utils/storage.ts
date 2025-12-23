/**
 * Secure storage utilities using sessionStorage
 * sessionStorage is cleared when the browser tab is closed
 * セッションベース認証ではトークンは不要（Cookieで管理）
 */

import { logger } from './logger';

const USER_KEY = 'user';

export const storage = {
  /**
   * Store minimal user information (only essential fields)
   */
  setUser: (user: { email: string; name: string; role: string; storeId?: string }): void => {
    try {
      // Store only essential user information, exclude sensitive data
      const minimalUser = {
        email: user.email,
        name: user.name,
        role: user.role,
        storeId: user.storeId,
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
  getUser: (): { email: string; name: string; role: string; storeId?: string } | null => {
    try {
      const userStr = sessionStorage.getItem(USER_KEY);
      if (!userStr) return null;

      // JSON.parseを実行
      const parsed = JSON.parse(userStr);

      // 型チェック: 必須フィールドが存在し、正しい型であることを確認
      if (
        typeof parsed !== 'object' ||
        parsed === null ||
        typeof parsed.email !== 'string' ||
        typeof parsed.name !== 'string' ||
        typeof parsed.role !== 'string'
      ) {
        logger.warn('Invalid user data format in storage, clearing', { parsed }, 'storage');
        storage.clear();
        return null;
      }

      // 必須フィールドが空でないことを確認
      if (!parsed.email || !parsed.name || !parsed.role) {
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
   * Clear all authentication data
   */
  clear: (): void => {
    try {
      sessionStorage.clear();
    } catch (error) {
      logger.error('Failed to clear storage', error, 'storage');
    }
  },
};
