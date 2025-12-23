import { useState, useEffect, useCallback } from 'react';
import { Lesson } from '../types/lesson';
import { lessonApi } from '../api/lessonApi';
import { PaginationParams } from '../types/common';
import { useErrorHandler } from './useErrorHandler';
import { useResource } from './useResource';

export const useLesson = (id?: string) => {
  const { resource, loading, error, refetch } = useResource<Lesson>({
    fetchFn: lessonApi.getById,
    id,
    context: 'useLesson.fetchLesson',
  });

  return { lesson: resource, loading, error, refetch };
};

export const useLessons = (params?: PaginationParams) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { handleError } = useErrorHandler();

  const fetchLessons = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await lessonApi.getAll(params);
      setLessons(data.data);
    } catch (err) {
      const errorMessage = handleError(err, 'useLessons.fetchLessons');
      setError(new Error(errorMessage));
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, handleError]);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  return { lessons, loading, error, refetch: fetchLessons };
};

export const useLessonsByCustomer = (customerId: string) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { handleError } = useErrorHandler();

  const fetchLessons = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await lessonApi.getByCustomerId(customerId);
      setLessons(data);
    } catch (err) {
      const errorMessage = handleError(err, 'useLessonsByCustomer.fetchLessons');
      setError(new Error(errorMessage));
    } finally {
      setLoading(false);
    }
  }, [customerId, handleError]);

  useEffect(() => {
    if (customerId) {
      fetchLessons();
    }
  }, [customerId, fetchLessons]);

  return { lessons, loading, error, refetch: fetchLessons };
};

