import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { Lesson, LessonHistoryItem } from '../types/lesson';
import { lessonApi } from '../api/lessonApi';
import { PaginationParams } from '../types/common';

/* =========================
 * 単一 Lesson 取得
 * ========================= */
export const useLesson = (id?: string) => {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchedIdRef = useRef<string | null>(null);

  const fetchLesson = useCallback(async (lessonId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await lessonApi.getById(lessonId);
      setLesson(data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('不明なエラーが発生しました');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!id) {
      return;
    }

    // 既に取得済みの場合は fetchLesson を実行しないガード
    if (fetchedIdRef.current === id) {
      return;
    }

    fetchedIdRef.current = id;
    fetchLesson(id);
  }, [id, fetchLesson]);

  return {
    lesson,
    loading,
    error,
    refetch: () => {
      if (id) {
        return fetchLesson(id);
      }
      return Promise.resolve();
    },
  };
};

/* =========================
 * Lesson 履歴一覧（ページング）
 * @deprecated バックエンドに実装されていないため、このフックは非推奨です
 * ========================= */
export const useLessons = (params?: PaginationParams) => {
  const [lessons, setLessons] = useState<LessonHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>('バックエンドに実装されていないため、レッスン履歴の取得は現在利用できません');

  const fetchLessons = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // バックエンドに実装が存在しないため、空のデータを返す
      setLessons([]);
      setError('バックエンドに実装されていないため、レッスン履歴の取得は現在利用できません');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('不明なエラーが発生しました');
      }
    } finally {
      setLoading(false);
    }
  }, [params?.page, params?.limit]);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  return {
    lessons,
    loading,
    error,
    refetch: fetchLessons,
  };
};

/* =========================
 * 顧客別 Lesson 一覧
 * ========================= */
export const useLessonsByCustomer = (customerId?: string) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchedCustomerIdRef = useRef<string | null>(null);

  const fetchLessons = useCallback(async () => {
    if (!customerId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await lessonApi.getByCustomer(customerId);
      const data = response.data || [];
      setLessons(data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('不明なエラーが発生しました');
      }
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    if (!customerId) {
      return;
    }

    // 既に取得済みの場合は fetchLessons を実行しないガード
    if (fetchedCustomerIdRef.current === customerId) {
      return;
    }

    fetchedCustomerIdRef.current = customerId;
    fetchLessons();
  }, [customerId, fetchLessons]);

  return {
    lessons,
    loading,
    error,
    refetch: fetchLessons,
  };
};