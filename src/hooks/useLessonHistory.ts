// hooks/useLessonHistory.ts
import { useState, useCallback, useEffect } from 'react';
import { LessonHistoryItem, LessonChartData } from '../types/lesson';

/**
 * @deprecated バックエンドに実装されていないため、このフックは非推奨です
 * バックエンドに実装が追加されるまで、空のデータを返します
 */
export const useLessonHistory = (storeId: string | 'all', viewMode: 'week' | 'month') => {
  const [history, setHistory] = useState<LessonHistoryItem[]>([]);
  const [chartData, setChartData] = useState<LessonChartData | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>('バックエンドに実装されていないため、レッスン履歴の取得は現在利用できません');

  const fetchAll = useCallback(async (page: number = 0) => {
    setLoading(true);
    setError(null);
    try {
      // バックエンドに実装が存在しないため、空のデータを返す
      setHistory([]);
      setTotal(0);
      setChartData(null);
      setError('バックエンドに実装されていないため、レッスン履歴の取得は現在利用できません');
    } catch (err: any) {
      setError(err.message || 'データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [storeId, viewMode]);

  useEffect(() => {
    fetchAll(0);
  }, [fetchAll]);

  return { history, chartData, total, loading, error, refetch: fetchAll };
};