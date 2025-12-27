import { useState, useEffect } from 'react';
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
  const { handleError } = useErrorHandler();

  useEffect(() => {
    if (!lessonId) {
      setLoading(false);
      return;
    }

    const loadLesson = async () => {
      setLoading(true);
      try {
        const data = await lessonApi.getLesson(lessonId);
        setLesson(data);
      } catch (err) {
        handleError(err, 'useLessonData');
      } finally {
        setLoading(false);
      }
    };

    loadLesson();
  }, [lessonId, handleError]);

  return { lesson, loading };
};
