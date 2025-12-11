import { useState, useEffect, useCallback } from 'react';
import { Posture } from '../types/posture';
import { postureApi } from '../api/postureApi';
import { PaginationParams } from '../types/common';

export const usePosture = (id?: string) => {
  const [posture, setPosture] = useState<Posture | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (id) {
      fetchPosture(id);
    }
  }, [id]);

  const fetchPosture = async (postureId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await postureApi.getById(postureId);
      setPosture(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { posture, loading, error, refetch: () => id && fetchPosture(id) };
};

export const usePostures = (params?: PaginationParams) => {
  const [postures, setPostures] = useState<Posture[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchPostures = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await postureApi.getAll(params);
      setPostures(data.data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchPostures();
  }, [fetchPostures]);

  return { postures, loading, error, refetch: fetchPostures };
};

export const usePosturesByCustomer = (customerId: string) => {
  const [postures, setPostures] = useState<Posture[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchPostures = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await postureApi.getByCustomerId(customerId);
      setPostures(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    if (customerId) {
      fetchPostures();
    }
  }, [customerId, fetchPostures]);

  return { postures, loading, error, refetch: fetchPostures };
};

