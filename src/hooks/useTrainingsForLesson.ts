import { useState, useEffect } from 'react';
import { logger } from '../utils/logger';
import { lessonApi } from '../api/lessonApi';
import { handleApiError } from '../utils/errorHandler';

interface Training {
  name: string;
  reps: number;
}

/**
 * Custom hook to fetch trainings for a lesson
 * 
 * @param lessonId - Lesson ID
 * @returns Trainings array, loading state
 */
export const useTrainingsForLesson = (lessonId: string | undefined) => {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!lessonId) {
      return;
    }

    const loadTrainings = async () => {
      setLoading(true);
      try {
        const response = await lessonApi.getLesson(lessonId) as any;
        const trainingsData = response.trainings || [];

        if (!Array.isArray(trainingsData)) {
          logger.warn('Invalid trainings data format', { data: trainingsData }, 'useTrainingsForLesson');
          setTrainings([]);
          return;
        }

        setTrainings(trainingsData);
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
