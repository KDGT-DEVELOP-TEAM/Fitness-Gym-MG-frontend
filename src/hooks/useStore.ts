import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { storeApi } from '../api/storeApi';
import { Store } from '../types/store';

// モジュールレベルの実行ガード（すべてのuseStores呼び出しで共有）
let globalHasFetched = false;
let globalFetchPromise: Promise<Store[]> | null = null;
let globalStoresCache: Store[] | null = null;

export const useStores = () => {
  const [stores, setStores] = useState<Store[]>(globalStoresCache || []);
  const [loading, setLoading] = useState(!globalHasFetched && !globalStoresCache);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 既にキャッシュがある場合は即座に設定
    if (globalStoresCache) {
      setStores(globalStoresCache);
      setLoading(false);
      return;
    }

    // 既に取得が開始されている場合は、そのPromiseを待つ
    if (globalFetchPromise) {
      globalFetchPromise
        .then((data) => {
          setStores(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error('店舗一覧の取得に失敗しました:', err);
          if (axios.isAxiosError(err)) {
            setError(err.response?.data?.message || err.message);
          } else if (err instanceof Error) {
            setError(err.message);
          } else {
            setError('店舗情報を取得できませんでした');
          }
          setLoading(false);
        });
      return;
    }

    // 最初の呼び出し時のみAPIリクエストを実行
    if (!globalHasFetched) {
      globalHasFetched = true;
      setLoading(true);
      setError(null);

      globalFetchPromise = storeApi.getStores()
        .then((data) => {
          globalStoresCache = data;
          globalFetchPromise = null;
          setStores(data);
          setLoading(false);
          return data;
        })
        .catch((err: unknown) => {
          console.error('店舗一覧の取得に失敗しました:', err);
          globalFetchPromise = null;
          
          if (axios.isAxiosError(err)) {
            setError(err.response?.data?.message || err.message);
          } else if (err instanceof Error) {
            setError(err.message);
          } else {
            setError('店舗情報を取得できませんでした');
          }
          setLoading(false);
          throw err;
        });
    }
  }, []);

  return {
    stores,
    loading,
    error,
  };
};