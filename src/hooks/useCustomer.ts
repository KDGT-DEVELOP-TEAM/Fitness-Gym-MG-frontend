import { useState, useCallback } from 'react';
import { adminCustomersApi, CustomerListParams } from '../api/admin/customersApi';
import { Customer, CustomerFormData } from '../types/customer';

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. 取得：APIを呼んで結果をセットするだけ
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
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  // 2. 作成・更新・削除：APIを直接呼ぶだけ
  // 成功後の再取得（refetch）はコンポーネント側の .then() で行わせる方針に統一します
  const createCustomer = (formData: CustomerFormData) => adminCustomersApi.createCustomer(formData);
  const updateCustomer = (formData: CustomerFormData, id: string) => adminCustomersApi.updateCustomer(id, formData);
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