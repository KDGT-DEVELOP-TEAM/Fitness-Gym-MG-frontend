import { useState, useEffect, useCallback } from 'react';
import { Customer } from '../types/customer';
import { customerApi } from '../api/customerApi';
import { PaginationParams } from '../types/common';
import { useErrorHandler } from './useErrorHandler';
import { useResource } from './useResource';

export const useCustomer = (id?: string) => {
  const { resource, loading, error, refetch } = useResource<Customer>({
    fetchFn: customerApi.getById,
    id,
    context: 'useCustomer.fetchCustomer',
  });

  return { customer: resource, loading, error, refetch };
};

export const useCustomers = (params?: PaginationParams) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { handleError } = useErrorHandler();

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await customerApi.getAll(params);
      setCustomers(data.data);
    } catch (err) {
      const errorMessage = handleError(err, 'useCustomers.fetchCustomers');
      setError(new Error(errorMessage));
    } finally {
      setLoading(false);
    }
  }, [params?.page, params?.limit, params, handleError]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return { customers, loading, error, refetch: fetchCustomers };
};

