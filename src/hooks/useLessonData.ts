import { useState, useEffect, useRef } from 'react';
import { Lesson } from '../types/lesson';
import { lessonApi } from '../api/lessonApi';
import { useErrorHandler } from './useErrorHandler';

/**
 * Custom hook to fetch lesson data by ID
 * 
 * @param lessonId - Lesson ID to fetch
 * @returns Lesson data, loading state, and error
 */
export const useLessonData = (lessonId: string | undefined) => {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchedLessonIdRef = useRef<string | null>(null);
  const { handleError } = useErrorHandler();
  const handleErrorRef = useRef(handleError);

  // handleErrorが変更された場合にのみ更新
  useEffect(() => {
    handleErrorRef.current = handleError;
  }, [handleError]);

  useEffect(() => {
    if (!lessonId) {
      setLoading(false);
      return;
    }

    // 既に取得済みの場合は loadLesson を実行しないガード
    if (fetchedLessonIdRef.current === lessonId) {
      return;
    }

    fetchedLessonIdRef.current = lessonId;

    const loadLesson = async () => {
      setLoading(true);
      try {
        const data = await lessonApi.getById(lessonId);
        setLesson(data);
      } catch (err) {
        handleErrorRef.current(err, 'useLessonData');
      } finally {
        setLoading(false);
      }
    };

    loadLesson();
  }, [lessonId]);

  return { lesson, loading };
};
