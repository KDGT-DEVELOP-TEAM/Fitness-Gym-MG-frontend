import { useState, useCallback } from 'react';
import axios from 'axios';
import { adminCustomersApi } from '../api/admin/customersApi';
import { managerCustomersApi } from '../api/manager/customersApi';
import { customerApi } from '../api/customerApi';
import { Customer, CustomerRequest, CustomerListParams } from '../types/api/customer';
import { useAuth } from '../context/AuthContext';

interface ApiError {
  message: string;
}

export const useCustomers = () => {
  const { user: authUser } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCustomers = useCallback(async (page: number = 0) => {
    if (!authUser) return;
    
    setLoading(true);
    setError(null);
    try {
      const params: CustomerListParams = {
        name: searchQuery || undefined,
        page,
        size: 10
      };
      
      // ロールに応じて適切なAPIを呼び出す
      const isAdmin = authUser.role?.toUpperCase() === 'ADMIN';
      let response;
      
      if (isAdmin) {
        response = await adminCustomersApi.getCustomers(params);
      } else {
        // MANAGERの場合
        const storeId = Array.isArray(authUser.storeIds) ? authUser.storeIds[0] : authUser.storeIds;
        if (!storeId) {
          throw new Error('店舗IDが取得できませんでした');
        }
        response = await managerCustomersApi.getCustomers(storeId, params);
      }
      
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
  }, [searchQuery, authUser]);

  // CustomerRequest 型を受け取るように修正
  const createCustomer = (data: CustomerRequest) => adminCustomersApi.createCustomer(data);
  const updateCustomer = (id: string, data: CustomerRequest) => customerApi.updateProfile(id, data);
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