/**
 * オプションデータ（店舗、ユーザー、顧客）を取得するカスタムフック
 * 再利用可能な方法でオプションリストの取得と管理を提供
 */

import { useEffect, useState, useRef } from 'react';
import { fetchAllOptions, Option } from '../api/optionsApi';

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
    // キャッシュが有効で、強制リフレッシュでない場合はキャッシュを使用
    const now = Date.now();
    if (!forceRefresh && cachedOptions && (now - cachedOptions.timestamp) < CACHE_DURATION_MS) {
      setStores(cachedOptions.stores);
      setUsers(cachedOptions.users);
      setCustomers(cachedOptions.customers);
      setLoading(false);
      return;
    }

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
          timestamp: now,
        };
      }
    } catch (err) {
      if (isMountedRef.current) {
        const errorMessage = err instanceof Error ? err.message : 'オプションの取得に失敗しました';
        setError(errorMessage);
      }
    } finally {
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
