import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { storeApi } from '../api/storeApi';
import { Store } from '../types/store';

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
            console.error('店舗一覧の取得に失敗しました:', err);
            if (axios.isAxiosError(err)) {
              setError(err.response?.data?.message || err.message);
            } else if (err instanceof Error) {
              setError(err.message);
            } else {
              setError('店舗情報を取得できませんでした');
            }
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
        console.error('店舗一覧の取得に失敗しました:', err);
        globalFetchPromise = null;
        
        if (isMountedRef.current) {
          if (axios.isAxiosError(err)) {
            setError(err.response?.data?.message || err.message);
          } else if (err instanceof Error) {
            setError(err.message);
          } else {
            setError('店舗情報を取得できませんでした');
          }
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