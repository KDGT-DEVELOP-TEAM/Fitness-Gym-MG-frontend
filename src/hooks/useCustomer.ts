import { useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import { adminCustomersApi } from '../api/admin/customersApi';
import { managerCustomersApi } from '../api/manager/customersApi';
import { trainerCustomersApi } from '../api/trainer/customersApi';
import { customerApi } from '../api/customerApi';
import { Customer, CustomerRequest, CustomerListParams } from '../types/api/customer';
import { useAuth } from '../context/AuthContext';
import { useStores } from './useStore';

interface ApiError {
  message: string;
}

export const useCustomers = () => {
  const { user: authUser } = useAuth();
  const { stores, loading: storesLoading } = useStores();
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]); // トレーナー用: 全件保持
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCustomers = useCallback(async (page: number = 0) => {
    if (!authUser) return;
    
    const role = authUser.role?.toUpperCase();
    const isAdmin = role === 'ADMIN';
    const isManager = role === 'MANAGER';
    
    // MANAGERロールの場合、storesの読み込みが完了するまで待つ
    if (isManager && storesLoading) {
      // storesLoading中はローディング状態を維持し、エラーメッセージは表示しない
      setLoading(true);
      setError(null);
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      if (role === 'TRAINER') {
        // トレーナーの場合: 全件取得してフロントエンドでページネーション
        const allCustomersData = await trainerCustomersApi.getCustomers();
        setAllCustomers(allCustomersData);
        
        // 検索フィルタリング
        let filteredCustomers = allCustomersData;
        if (searchQuery.trim()) {
          const normalizedQuery = searchQuery.toLowerCase();
          filteredCustomers = allCustomersData.filter(customer =>
            customer.name.toLowerCase().includes(normalizedQuery) ||
            (customer.kana && customer.kana.toLowerCase().includes(normalizedQuery))
          );
        }
        
        // フロントエンドでページネーション
        const pageSize = 10;
        const startIndex = page * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);
        
        setCustomers(paginatedCustomers);
        setTotal(filteredCustomers.length);
      } else {
        // ADMIN/MANAGERの場合: バックエンドでページネーション
        const params: CustomerListParams = {
          name: searchQuery || undefined,
          page,
          size: 10
        };
        
        let response;
        
        if (isAdmin) {
          response = await adminCustomersApi.getCustomers(params);
        } else {
          // MANAGERロールの場合、storeIdを取得
          const storeId = Array.isArray(authUser.storeIds) && authUser.storeIds.length > 0
            ? authUser.storeIds[0]
            : (stores && stores.length > 0 ? stores[0].id : null);
          
          if (!storeId) {
            // storesLoadingが完了し、かつstoreIdが取得できない場合のみエラーメッセージを表示
            throw new Error('店舗IDが取得できませんでした');
          }
          
          response = await managerCustomersApi.getCustomers(storeId, params);
        }
        
        setCustomers(response.data);
        setTotal(response.total);
      }
    } catch (err: unknown) {
      let errorMessage = 'データの取得に失敗しました';
      if (axios.isAxiosError<ApiError>(err)) {
        errorMessage = err.response?.data?.message || err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, authUser, stores, storesLoading]);

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