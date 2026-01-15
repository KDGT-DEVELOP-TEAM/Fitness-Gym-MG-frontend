import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { storeApi } from '../api/storeApi';
import { Store } from '../types/store';

export const useStores = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    // 既に取得を開始している場合は実行しないガード
    if (hasFetchedRef.current) {
      return;
    }

    hasFetchedRef.current = true;

    const fetchStores = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await storeApi.getStores();
        setStores(data);
      } catch (err: unknown) {
        console.error('店舗一覧の取得に失敗しました:', err);

        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || err.message);
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('店舗情報を取得できませんでした');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, []);

  return {
    stores,
    loading,
    error,
  };
};