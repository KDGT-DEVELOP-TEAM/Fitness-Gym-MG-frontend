import { useState, useCallback } from 'react';
import axios from 'axios';
import { adminCustomersApi } from '../api/admin/customersApi';
import { Customer, CustomerRequest, CustomerListParams } from '../types/api/customer';

interface ApiError {
  message: string;
}

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCustomers = useCallback(async (page: number = 0) => {
    setLoading(true);
    setError(null);
    try {
      const params: CustomerListParams = {
        name: searchQuery || undefined,
        page,
        size: 10
      };
      const response = await adminCustomersApi.getCustomers(params);
      setCustomers(response.data);
      setTotal(response.total);
    } catch (err: unknown) {
      let errorMessage = 'データの取得に失敗しました';
      if (axios.isAxiosError<ApiError>(err)) {
        errorMessage = err.response?.data?.message || err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  // CustomerRequest 型を受け取るように修正
  const createCustomer = (data: CustomerRequest) => adminCustomersApi.createCustomer(data);
  const updateCustomer = (id: string, data: CustomerRequest) => adminCustomersApi.updateCustomer(id, data);
  const deleteCustomer = (id: string) => adminCustomersApi.deleteCustomer(id);

  return {
    customers,
    total,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    refetch: fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
  };
};