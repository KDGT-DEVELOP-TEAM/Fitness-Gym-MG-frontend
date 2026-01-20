import { useState, useEffect, useRef } from 'react';
import { storeApi } from '../api/storeApi';
import { Store } from '../types/store';
import { useErrorHandler } from './useErrorHandler';

// モジュールレベルのキャッシュ（アプリケーション全体で共有）
interface CachedStores {
  stores: Store[];
  timestamp: number;
}

/**
 * キャッシュの有効期限（ミリ秒）
 * 5分間キャッシュを保持
 */
const CACHE_DURATION_MS = 5 * 60 * 1000;
let cachedStores: CachedStores | null = null;
let globalFetchPromise: Promise<Store[]> | null = null;

export const useStores = () => {
  const [stores, setStores] = useState<Store[]>(cachedStores?.stores || []);
  const [loading, setLoading] = useState(!cachedStores);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);
  const { handleError } = useErrorHandler();
  const handleErrorRef = useRef(handleError);

  // handleErrorが変更された場合にrefを更新
  useEffect(() => {
    handleErrorRef.current = handleError;
  }, [handleError]);

  const loadStores = async (forceRefresh = false) => {
    // キャッシュが有効で、強制リフレッシュでない場合はキャッシュを使用
    const now = Date.now();
    if (!forceRefresh && cachedStores && (now - cachedStores.timestamp) < CACHE_DURATION_MS) {
      if (isMountedRef.current) {
        setStores(cachedStores.stores);
        setLoading(false);
      }
      return;
    }

    // 既に取得が開始されている場合は、そのPromiseを待つ
    if (globalFetchPromise) {
      globalFetchPromise
        .then((data) => {
          if (isMountedRef.current) {
            setStores(data);
            setLoading(false);
          }
        })
        .catch((err) => {
          if (isMountedRef.current) {
            const errorMessage = handleErrorRef.current(err, 'useStore');
            setError(errorMessage);
            setLoading(false);
          }
        });
      return;
    }

    // APIリクエストを実行
    if (isMountedRef.current) {
      setLoading(true);
      setError(null);
    }

    globalFetchPromise = storeApi.getStores()
      .then((data) => {
        const timestamp = Date.now();
        cachedStores = {
          stores: data,
          timestamp,
        };
        globalFetchPromise = null;
        
        if (isMountedRef.current) {
          setStores(data);
          setLoading(false);
        }
        return data;
      })
      .catch((err: unknown) => {
        globalFetchPromise = null;
        
        if (isMountedRef.current) {
          const errorMessage = handleErrorRef.current(err, 'useStore');
          setError(errorMessage);
          setLoading(false);
        }
        throw err;
      });
  };

  useEffect(() => {
    isMountedRef.current = true;
    loadStores();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    stores,
    loading,
    error,
    refetch: () => loadStores(true),
  };
};