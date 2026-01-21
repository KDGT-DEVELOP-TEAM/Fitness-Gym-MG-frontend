import { useState, useEffect, useCallback, useRef } from 'react';
import { Lesson } from '../types/lesson';
import { lessonApi } from '../api/lessonApi';
import { useErrorHandler } from './useErrorHandler';

/* =========================
 * 単一 Lesson 取得
 * ========================= */
export const useLesson = (id?: string) => {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchedIdRef = useRef<string | null>(null);
  const { handleError } = useErrorHandler();
  const handleErrorRef = useRef(handleError);

  // handleErrorが変更された場合にrefを更新
  useEffect(() => {
    handleErrorRef.current = handleError;
  }, [handleError]);

  const fetchLesson = useCallback(async (lessonId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await lessonApi.getById(lessonId);
      setLesson(data);
    } catch (err: unknown) {
      const errorMessage = handleErrorRef.current(err, 'useLesson');
      setError(errorMessage);
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
 * 顧客別 Lesson 一覧
 * ========================= */
export const useLessonsByCustomer = (customerId?: string) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchedCustomerIdRef = useRef<string | null>(null);
  const { handleError } = useErrorHandler();
  const handleErrorRef = useRef(handleError);

  // handleErrorが変更された場合にrefを更新
  useEffect(() => {
    handleErrorRef.current = handleError;
  }, [handleError]);

  const fetchLessons = useCallback(async () => {
    if (!customerId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await lessonApi.getByCustomer(customerId);
      const data = response.data || [];
      setLessons(data);
    } catch (err: unknown) {
      const errorMessage = handleErrorRef.current(err, 'useLessonsByCustomer');
      setError(errorMessage);
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