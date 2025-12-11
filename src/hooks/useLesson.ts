import { useState, useEffect, useCallback } from 'react';
import { Lesson } from '../types/lesson';
import { lessonApi } from '../api/lessonApi';
import { PaginationParams } from '../types/common';

export const useLesson = (id?: string) => {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (id) {
      fetchLesson(id);
    }
  }, [id]);

  const fetchLesson = async (lessonId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await lessonApi.getById(lessonId);
      setLesson(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { lesson, loading, error, refetch: () => id && fetchLesson(id) };
};

export const useLessons = (params?: PaginationParams) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLessons = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await lessonApi.getAll(params);
      setLessons(data.data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [params?.page, params?.limit, params]);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  return { lessons, loading, error, refetch: fetchLessons };
};

export const useLessonsByCustomer = (customerId: string) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLessons = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await lessonApi.getByCustomerId(customerId);
      setLessons(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    if (customerId) {
      fetchLessons();
    }
  }, [customerId, fetchLessons]);

  return { lessons, loading, error, refetch: fetchLessons };
};

