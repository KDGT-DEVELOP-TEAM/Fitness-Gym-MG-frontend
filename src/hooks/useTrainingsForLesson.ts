import { useState, useEffect } from 'react';
import { logger } from '../utils/logger';
import { lessonApi } from '../api/lessonApi';
import { handleApiError } from '../utils/errorHandler';
import { TrainingResponse } from '../types/lesson';

/**
 * Custom hook to fetch trainings for a lesson
 * 
 * LessonResponseにはtrainingsフィールドが含まれているため、
 * lessonApi.getLessonから取得したレスポンスからtrainingsを抽出します。
 * 
 * @param lessonId - Lesson ID
 * @returns Trainings array, loading state
 */
export const useTrainingsForLesson = (lessonId: string | undefined) => {
  const [trainings, setTrainings] = useState<TrainingResponse[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!lessonId) {
      return;
    }

    const loadTrainings = async () => {
      setLoading(true);
      try {
        // バックエンドのLessonResponseにはtrainingsフィールドが含まれている
        const lessonResponse = await lessonApi.getById(lessonId);
        const trainingsData = lessonResponse.trainings || [];

        if (!Array.isArray(trainingsData)) {
          logger.warn('Invalid trainings data format', { data: trainingsData }, 'useTrainingsForLesson');
          setTrainings([]);
          return;
        }

        // orderNoでソート（バックエンドから順序が保証されているが、念のため）
        const sortedTrainings = [...trainingsData].sort((a, b) => (a.orderNo || 0) - (b.orderNo || 0));
        setTrainings(sortedTrainings);
      } catch (err) {
        const appError = handleApiError(err);
        logger.error('Error fetching trainings', appError, 'useTrainingsForLesson');
        setTrainings([]);
      } finally {
        setLoading(false);
      }
    };

    loadTrainings();
  }, [lessonId]);

  return { trainings, loading };
};
