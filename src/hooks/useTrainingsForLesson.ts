import { useState, useEffect } from 'react';
import { logger } from '../utils/logger';
import axiosInstance from '../api/axiosConfig';
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
        const response = await axiosInstance.get<Training[]>(`/lessons/${lessonId}/trainings`);

        if (!response.data || !Array.isArray(response.data)) {
          logger.warn('Invalid trainings data format', { data: response.data }, 'useTrainingsForLesson');
          setTrainings([]);
          return;
        }

        setTrainings(response.data);
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
