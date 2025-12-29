// src/hooks/useStore.ts
import { useState, useEffect } from 'react';
import { storeApi } from '../api/storeApi';
import { Store } from '../types/store';

export const useStores = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStores = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await storeApi.getStores();
        setStores(data);
      } catch (err: any) {
        console.error('店舗一覧の取得に失敗しました:', err);
        setError(err.response?.data?.message || '店舗情報を取得できませんでした');
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, []);

  return { stores, loading, error };
};