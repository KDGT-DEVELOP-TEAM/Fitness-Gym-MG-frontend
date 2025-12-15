import { useState, useEffect, useCallback } from 'react';
import { Posture } from '../types/posture';
import { postureApi } from '../api/postureApi';
import { PaginationParams } from '../types/common';
import { useErrorHandler } from './useErrorHandler';
import { useResource } from './useResource';

export const usePosture = (id?: string) => {
  const { resource, loading, error, refetch } = useResource<Posture>({
    fetchFn: postureApi.getById,
    id,
    context: 'usePosture.fetchPosture',
  });

  return { posture: resource, loading, error, refetch };
};

export const usePostures = (params?: PaginationParams) => {
  const [postures, setPostures] = useState<Posture[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { handleError } = useErrorHandler();

  const fetchPostures = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await postureApi.getAll(params);
      setPostures(data.data);
    } catch (err) {
      const errorMessage = handleError(err, 'usePostures.fetchPostures');
      setError(new Error(errorMessage));
    } finally {
      setLoading(false);
    }
  }, [params, handleError]);

  useEffect(() => {
    fetchPostures();
  }, [fetchPostures]);

  return { postures, loading, error, refetch: fetchPostures };
};

export const usePosturesByCustomer = (customerId: string) => {
  const [postures, setPostures] = useState<Posture[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { handleError } = useErrorHandler();

  const fetchPostures = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await postureApi.getByCustomerId(customerId);
      setPostures(data);
    } catch (err) {
      const errorMessage = handleError(err, 'usePosturesByCustomer.fetchPostures');
      setError(new Error(errorMessage));
    } finally {
      setLoading(false);
    }
  }, [customerId, handleError]);

  useEffect(() => {
    if (customerId) {
      fetchPostures();
    }
  }, [customerId, fetchPostures]);

  return { postures, loading, error, refetch: fetchPostures };
};

