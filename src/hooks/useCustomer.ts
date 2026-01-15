import { useState, useCallback, useRef, useEffect } from 'react';
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

export const useCustomers = (selectedStoreId?: string) => {
  const { user: authUser } = useAuth();
  const { stores, loading: storesLoading } = useStores();
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]); // トレーナー用: 全件保持
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // MANAGERの場合のみ、storesとstoresLoadingをrefで保持（トレーナーの場合は不要）
  const storesRef = useRef(stores);
  const storesLoadingRef = useRef(storesLoading);
  const fetchCustomersRef = useRef<((page: number) => Promise<void>) | null>(null);
  
  useEffect(() => {
    storesRef.current = stores;
    storesLoadingRef.current = storesLoading;
  }, [stores, storesLoading]);

  const fetchCustomers = useCallback(async (page: number = 0) => {
    if (!authUser) return;
    
    const role = authUser.role?.toUpperCase();
    const isAdmin = role === 'ADMIN';
    const isManager = role === 'MANAGER';
    const isTrainer = role === 'TRAINER';
    
    // MANAGERロールの場合、storesの読み込みが完了するまで待つ
    // トレーナーの場合はstoresLoadingをチェックしない
    if (isManager && storesLoadingRef.current) {
      // storesLoading中はローディング状態を維持し、エラーメッセージは表示しない
      setLoading(true);
      setError(null);
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      if (isTrainer) {
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
          // ADMINの場合: selectedStoreIdが指定されている場合はそれを使用（nullの場合は全店舗）
          if (selectedStoreId) {
            params.storeId = selectedStoreId;
          }
          response = await adminCustomersApi.getCustomers(params);
        } else {
          // MANAGERロールの場合、storeIdを取得
          // selectedStoreIdが指定されている場合はそれを使用、否则は従来のロジック
          let storeId: string | null = null;
          
          if (selectedStoreId) {
            storeId = selectedStoreId;
          } else {
            const currentStores = storesRef.current;
            storeId = Array.isArray(authUser.storeIds) && authUser.storeIds.length > 0
              ? authUser.storeIds[0]
              : (currentStores && currentStores.length > 0 ? currentStores[0].id : null);
          }
          
          if (!storeId) {
            // 店舗情報がまだ読み込み中の場合は、エラーを設定せずに早期リターン
            if (storesLoadingRef.current) {
              setLoading(true);
              setError(null);
              return;
            }
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
  }, [searchQuery, authUser, selectedStoreId]); // storesとstoresLoadingを依存配列から削除、selectedStoreIdを追加

  // fetchCustomersの最新バージョンをrefで保持
  useEffect(() => {
    fetchCustomersRef.current = fetchCustomers;
  }, [fetchCustomers]);

  // MANAGERロールの場合、店舗情報の読み込み完了後に自動的に顧客データを取得
  // selectedStoreIdが指定されている場合は、その店舗のデータを取得
  const hasInitialFetchedRef = useRef(false);
  const previousSelectedStoreIdRef = useRef<string | undefined>(selectedStoreId);
  useEffect(() => {
    if (!authUser) return;
    const role = authUser.role?.toUpperCase();
    const isManager = role === 'MANAGER';
    
    // selectedStoreIdが変更された場合は、フラグをリセットして再取得
    if (selectedStoreId !== previousSelectedStoreIdRef.current) {
      hasInitialFetchedRef.current = false;
      previousSelectedStoreIdRef.current = selectedStoreId;
    }
    
    // 店舗情報が読み込み完了し、かつ店舗が存在する場合に顧客データを取得
    // 初回のみ実行する（重複実行を防ぐ）
    if (isManager && !storesLoading && stores.length > 0 && fetchCustomersRef.current && !hasInitialFetchedRef.current) {
      // selectedStoreIdが指定されている場合、または初期値が設定されている場合のみ実行
      if (selectedStoreId || (Array.isArray(authUser.storeIds) && authUser.storeIds.length > 0) || stores.length > 0) {
        hasInitialFetchedRef.current = true;
        fetchCustomersRef.current(0);
      }
    }
    
    // authUserが変わった場合は、フラグをリセット
    if (authUser) {
      const currentIsManager = authUser.role?.toUpperCase() === 'MANAGER';
      if (!currentIsManager) {
        hasInitialFetchedRef.current = false;
      }
    }
  }, [authUser, storesLoading, stores, selectedStoreId]); // fetchCustomersは依存配列に含めない（ref経由でアクセス）、selectedStoreIdを追加

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