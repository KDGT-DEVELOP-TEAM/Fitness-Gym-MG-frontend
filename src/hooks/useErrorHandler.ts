import { useCallback } from 'react';
import { handleApiError, handleNetworkError, getUserFriendlyMessage, logError, AppError } from '../utils/errorHandler';

/**
 * Custom hook for unified error handling
 * Provides consistent error handling across components
 */
export const useErrorHandler = () => {
  const handleError = useCallback((error: unknown, context: string): string => {
    let appError: AppError;

    // Determine error type and handle accordingly
    if (error && typeof error === 'object' && ('response' in error || 'isAxiosError' in error)) {
      // Likely an Axios/API error
      appError = handleApiError(error);
    } else if (error instanceof Error && (error.message.includes('Network') || error.message.includes('fetch'))) {
      // Network error
      appError = handleNetworkError(error);
    } else {
      // Fallback to API error handler
      appError = handleApiError(error);
    }

    // Log the error
    logError(appError, context);

    // Return user-friendly message
    return getUserFriendlyMessage(appError);
  }, []);

  return { handleError };
};
