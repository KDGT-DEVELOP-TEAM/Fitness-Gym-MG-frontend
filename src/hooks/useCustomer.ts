import { useState, useCallback, useRef, useEffect } from 'react';
import axios from 'axios';
import { adminCustomersApi } from '../api/admin/customersApi';
import { managerCustomersApi } from '../api/manager/customersApi';
import { trainerCustomersApi } from '../api/trainer/customersApi';
import { customerApi } from '../api/customerApi';
import { Customer, CustomerRequest, CustomerListParams } from '../types/api/customer';
import { useAuth } from '../context/AuthContext';
import { useStores } from './useStore';
import { getStoreIdForManagerOrThrow } from '../utils/storeUtils';
import { isAdmin, isManager, isTrainer } from '../utils/roleUtils';

interface ApiError {
  message: string;
}

export const useCustomers = (selectedStoreId?: string) => {
  const { user: authUser } = useAuth();
  const { stores, loading: storesLoading } = useStores();
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]); // トレーナー用: 全件保持
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // searchQueryをrefで保持（fetchCustomersの依存配列から除外するため）
  const searchQueryRef = useRef(searchQuery);
  
  // MANAGERの場合のみ、storesとstoresLoadingをrefで保持（トレーナーの場合は不要）
  const storesRef = useRef(stores);
  const storesLoadingRef = useRef(storesLoading);
  
  useEffect(() => {
    searchQueryRef.current = searchQuery;
  }, [searchQuery]);
  
  useEffect(() => {
    storesRef.current = stores;
    storesLoadingRef.current = storesLoading;
  }, [stores, storesLoading]);

  const fetchCustomers = useCallback(async (page: number = 0) => {
    if (!authUser) return;
    
    setLoading(true);
    setError(null);
    try {
      if (isTrainer(authUser)) {
        // トレーナーの場合: 店舗IDを指定して取得
        const params: CustomerListParams = {
          storeId: selectedStoreId || undefined,
        };
        const allCustomersData = await trainerCustomersApi.getCustomers(params) as Customer[];
        setAllCustomers(allCustomersData);
        
        // 検索フィルタリング
        let filteredCustomers = allCustomersData;
        if (searchQueryRef.current.trim()) {
          const normalizedQuery = searchQueryRef.current.toLowerCase();
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
          name: searchQueryRef.current || undefined,
          page,
          size: 10
        };
        
        let response;
        
        if (isAdmin(authUser)) {
          // ADMINの場合: selectedStoreIdが指定されている場合はそれを使用（nullの場合は全店舗）
          if (selectedStoreId) {
            params.storeId = selectedStoreId;
          }
          response = await adminCustomersApi.getCustomers(params);
        } else {
          // MANAGERロールの場合、storeIdを取得
          const storeId = getStoreIdForManagerOrThrow(
            authUser,
            selectedStoreId,
            storesRef.current
          );
          
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
  }, [authUser, selectedStoreId]); // searchQueryを依存配列から除外（searchQueryRef.currentを使用するため）


  // ロールベースのAPI選択を実装
  const createCustomer = async (data: CustomerRequest) => {
    if (!authUser) {
      throw new Error('認証が必要です');
    }
    
    if (isAdmin(authUser)) {
      await adminCustomersApi.createCustomer(data);
    } else if (isManager(authUser)) {
      // MANAGERの場合はstoreIdは不要（バックエンドの実装による）
      // POST /api/manager/customers を使用
      await managerCustomersApi.createCustomer(data);
    } else {
      throw new Error('この操作を実行する権限がありません');
    }
  };

  const updateCustomer = (id: string, data: CustomerRequest) => 
    customerApi.updateProfile(id, data);

  const deleteCustomer = async (id: string) => {
    if (!authUser) {
      throw new Error('認証が必要です');
    }
    
    if (isAdmin(authUser)) {
      await adminCustomersApi.deleteCustomer(id);
    } else if (isManager(authUser)) {
      // MANAGERの場合はstoreIdが必要
      // DELETE /api/stores/{storeId}/manager/customers/{customerId} を使用
      const storeId = getStoreIdForManagerOrThrow(
        authUser,
        selectedStoreId,
        storesRef.current
      );
      await managerCustomersApi.deleteCustomer(storeId, id);
    } else {
      throw new Error('この操作を実行する権限がありません');
    }
  };

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