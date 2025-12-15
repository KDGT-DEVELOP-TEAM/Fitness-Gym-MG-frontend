import { useState, useEffect, useCallback } from 'react';
import { useErrorHandler } from './useErrorHandler';

/**
 * Options for useResource hook
 */
interface UseResourceOptions<T> {
  /** Function to fetch a single resource by ID */
  fetchFn: (id: string) => Promise<T>;
  /** Resource ID (optional) */
  id?: string;
  /** Context string for error logging */
  context: string;
}

/**
 * Generic hook for fetching a single resource by ID
 * Provides loading state, error handling, and refetch functionality
 * 
 * @param options - Configuration options for the hook
 * @returns Resource data, loading state, error, and refetch function
 */
export const useResource = <T>({ fetchFn, id, context }: UseResourceOptions<T>) => {
  const [resource, setResource] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { handleError } = useErrorHandler();

  const fetchResource = useCallback(
    async (resourceId: string) => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchFn(resourceId);
        setResource(data);
      } catch (err) {
        const errorMessage = handleError(err, context);
        setError(new Error(errorMessage));
      } finally {
        setLoading(false);
      }
    },
    [fetchFn, handleError, context]
  );

  useEffect(() => {
    if (id) {
      fetchResource(id);
    }
  }, [id, fetchResource]);

  return { resource, loading, error, refetch: () => id && fetchResource(id) };
};
