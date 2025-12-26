// hooks/useLessonHistory.ts
import { useState, useCallback, useEffect } from 'react';
import { lessonApi } from '../api/lessonApi';
import { LessonHistoryItem, LessonChartData } from '../types/lesson';

export const useLessonHistory = (storeId: string | 'all', viewMode: 'week' | 'month') => {
  const [history, setHistory] = useState<LessonHistoryItem[]>([]);
  const [chartData, setChartData] = useState<LessonChartData | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async (page: number = 0) => {
    setLoading(true);
    setError(null);
    try {
      const sId = storeId === 'all' ? undefined : storeId;
      
      // 履歴とグラフデータを並列で取得
      const [historyRes, chartRes] = await Promise.all([
        lessonApi.getHistory({ storeId: sId, page, size: 10 }),
        lessonApi.getChartData(sId || '', viewMode)
      ]);

      setHistory(historyRes.data);
      setTotal(historyRes.total);
      setChartData(chartRes);
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