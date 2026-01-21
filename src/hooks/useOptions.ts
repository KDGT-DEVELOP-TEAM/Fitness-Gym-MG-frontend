/**
 * オプションデータ（店舗、ユーザー、顧客）を取得するカスタムフック
 * 再利用可能な方法でオプションリストの取得と管理を提供
 */

import { useEffect, useState, useRef } from 'react';
import { fetchAllOptions, Option } from '../api/optionsApi';
import { logger } from '../utils/logger';

export type { Option };

interface UseOptionsResult {
  stores: Option[];
  users: Option[];
  customers: Option[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// モジュールレベルのキャッシュ（アプリケーション全体で共有）
interface CachedOptions {
  stores: Option[];
  users: Option[];
  customers: Option[];
  timestamp: number;
}

/**
 * キャッシュの有効期限（ミリ秒）
 * 5分間キャッシュを保持
 */
const CACHE_DURATION_MS = 5 * 60 * 1000;
let cachedOptions: CachedOptions | null = null;

/**
 * グローバルなロード状態フラグ
 * 複数のコンポーネントから同時に呼ばれても、fetchAllOptionsは1回のみ実行される
 */
let isLoadingOptions = false;

/**
 * すべてのオプション（店舗、ユーザー、顧客）を取得するフック
 * キャッシュ機能付きで、パフォーマンスを向上
 */
export const useOptions = (): UseOptionsResult => {
  const [stores, setStores] = useState<Option[]>([]);
  const [users, setUsers] = useState<Option[]>([]);
  const [customers, setCustomers] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  const loadOptions = async (forceRefresh = false) => {
    const now = Date.now();
    
    // キャッシュが有効で、強制リフレッシュでない場合はキャッシュを使用
    if (!forceRefresh && cachedOptions && (now - cachedOptions.timestamp) < CACHE_DURATION_MS) {
      logger.debug('Using cached options', { age: now - cachedOptions.timestamp }, 'useOptions');
      setStores(cachedOptions.stores);
      setUsers(cachedOptions.users);
      setCustomers(cachedOptions.customers);
      setLoading(false);
      return;
    }

    // 既にロード中の場合は、キャッシュが更新されるのを待つ
    if (isLoadingOptions && !forceRefresh) {
      logger.debug('Options already loading, waiting...', {}, 'useOptions');
      // 少し待ってからキャッシュをチェック（他のインスタンスがロード中）
      await new Promise(resolve => setTimeout(resolve, 100));
      if (cachedOptions && (now - cachedOptions.timestamp) < CACHE_DURATION_MS) {
        logger.debug('Cache updated by another instance', {}, 'useOptions');
        setStores(cachedOptions.stores);
        setUsers(cachedOptions.users);
        setCustomers(cachedOptions.customers);
        setLoading(false);
        return;
      }
    }

    // ロード中フラグを設定
    logger.debug('Starting to load options', { forceRefresh }, 'useOptions');
    isLoadingOptions = true;
    setLoading(true);
    setError(null);

    try {
      const options = await fetchAllOptions();
      
      // マウントされている場合のみ状態を更新
      if (isMountedRef.current) {
        setStores(options.stores);
        setUsers(options.users);
        setCustomers(options.customers);
        
        // キャッシュを更新
        cachedOptions = {
          stores: options.stores,
          users: options.users,
          customers: options.customers,
          timestamp: Date.now(),
        };
        
        logger.debug('Options loaded and cached', 
          { storesCount: options.stores.length, usersCount: options.users.length, customersCount: options.customers.length }, 
          'useOptions');
      }
    } catch (err) {
      if (isMountedRef.current) {
        const errorMessage = err instanceof Error ? err.message : 'オプションの取得に失敗しました';
        setError(errorMessage);
        logger.error('Failed to load options', err, 'useOptions');
      }
    } finally {
      isLoadingOptions = false;
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    loadOptions();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return { stores, users, customers, loading, error, refetch: () => loadOptions(true) };
};
