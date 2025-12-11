import { useState, useEffect, useCallback } from 'react';
import { Customer } from '../types/customer';
import { customerApi } from '../api/customerApi';
import { PaginationParams } from '../types/common';

export const useCustomer = (id?: string) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (id) {
      fetchCustomer(id);
    }
  }, [id]);

  const fetchCustomer = async (customerId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await customerApi.getById(customerId);
      setCustomer(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { customer, loading, error, refetch: () => id && fetchCustomer(id) };
};

export const useCustomers = (params?: PaginationParams) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await customerApi.getAll(params);
      setCustomers(data.data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [params?.page, params?.limit, params]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return { customers, loading, error, refetch: fetchCustomers };
};

