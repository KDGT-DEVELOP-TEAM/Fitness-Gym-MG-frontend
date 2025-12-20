import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { LessonHistoryItem } from '../types/lesson';

/**
 * レッスン履歴取得用カスタムフック
 * @param selectedStoreId adminユーザーが選択している店舗ID ('all' または UUID)
 */
export const useLessonHistory = (selectedStoreId: string) => {
  const { user } = useAuth();
  const [history, setHistory] = useState<LessonHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    // ユーザー情報がない場合は実行しない
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      // 基本クエリの構築
      // start_date が現在時刻より前のものを「履歴」として取得
      let query = supabase
        .from('lessons')
        .select(`
          *,
          stores!store_id ( name ),
          users!user_id ( name ),
          customers!customer_id ( name )
        `)
        .lt('start_date', new Date().toISOString()) // 過去のレッスンのみ
        .order('start_date', { ascending: false });

      // 権限によるフィルタリング
      if (user.role === 'manager') {
        // managerは所属店舗のみ（storeIdが配列か単一文字列かに対応）
        const storeIds = Array.isArray(user.storeId) ? user.storeId : [user.storeId];
        if (storeIds.length > 0) {
          query = query.in('store_id', storeIds);
        }
      } else if (user.role === 'admin') {
        // adminは選択された店舗で絞り込み
        if (selectedStoreId !== 'all') {
          query = query.eq('store_id', selectedStoreId);
        }
      }

      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;

      // 🔑 取得したデータをマッピングして型を統一する
      const formattedData: LessonHistoryItem[] = (data as any[]).map(item => ({
        ...item,
        startDate: item.start_date, // start_date を startDate にコピー
        endDate: item.end_date,     // end_date を endDate にコピー
        // 外部キー結合部分のパース (stores!store_id 対策)
        stores: item.stores,
        users: item.users,
        customers: item.customers
      }));

      setHistory(formattedData || []);
      
    } catch (err: any) {
      console.error('Failed to fetch lesson history:', err);
      setError(err.message || '履歴の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [user, selectedStoreId]);

  // 初回および依存関係変更時にフェッチ
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return {
    history,
    loading,
    error,
    refetch: fetchHistory
  };
};