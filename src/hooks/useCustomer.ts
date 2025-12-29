import { useState, useEffect, useCallback } from 'react';
import { Customer } from '../types/customer';
import { customerApi } from '../api/customerApi';
import { useErrorHandler } from './useErrorHandler';
import { useResource } from './useResource';

export const useCustomer = (id?: string) => {
  const { resource, loading, error, refetch } = useResource<Customer>({
    fetchFn: customerApi.getProfile,
    id,
    context: 'useCustomer.fetchCustomer',
  });

  return { customer: resource, loading, error, refetch };
};

