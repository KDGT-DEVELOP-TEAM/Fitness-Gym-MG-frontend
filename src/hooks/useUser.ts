import { useState, useCallback, useRef, useEffect } from 'react';
import { adminUsersApi } from '../api/admin/usersApi';
import { managerUsersApi } from '../api/manager/usersApi';
import { useAuth } from '../context/AuthContext';
import { useStores } from './useStore';
import { User, UserRequest, UserListParams } from '../types/api/user';
import { UserFilters } from '../types/form/user';

export const useUser = (selectedStoreId?: string) => {
  const { user: authUser } = useAuth();
  const { stores, loading: storesLoading } = useStores();
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<UserFilters>({
    nameOrKana: '',
    role: 'all',
  });
  
  // filtersをrefで保持（refetchUsersの依存配列から除外するため）
  const filtersRef = useRef(filters);
  
  // storesとstoresLoadingをrefで保持
  const storesRef = useRef(stores);
  const storesLoadingRef = useRef(storesLoading);
  
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);
  
  useEffect(() => {
    storesRef.current = stores;
    storesLoadingRef.current = storesLoading;
  }, [stores, storesLoading]);

  const refetchUsers = useCallback(async (page = 0) => {
    const isAdmin = authUser?.role?.toUpperCase() === 'ADMIN';

    setLoading(true);
    setError(null);
    try {
      const params: UserListParams = {
        page,
        size: 10,
        name: filtersRef.current.nameOrKana || undefined,
        // Managerの場合は権限フィルタを無効化（roleパラメータを送信しない）
        role: isAdmin && filtersRef.current.role !== 'all' ? filtersRef.current.role : undefined,
      };
      
      // ロールに応じて適切なAPIを呼び出す
      let res;
      
      if (isAdmin) {
        res = await adminUsersApi.getUsers(params);
      } else {
        // MANAGERロールの場合、storeIdを取得
        // selectedStoreIdが指定されている場合はそれを使用、否则は従来のロジック
        let storeId: string | null = null;
        
        if (selectedStoreId) {
          storeId = selectedStoreId;
        } else {
          const currentStores = storesRef.current;
          storeId = Array.isArray(authUser?.storeIds) && authUser.storeIds.length > 0
            ? authUser.storeIds[0]
            : (currentStores && currentStores.length > 0 ? currentStores[0].id : null);
        }
        
        if (!storeId) {
          // storeIdが取得できない場合はエラーをスロー
          throw new Error('店舗IDが取得できませんでした');
        }
        
        res = await managerUsersApi.getUsers(storeId, params);
      }
      
      setUsers(res.data);
      setTotal(res.total);
    } catch (e) {
      setError('ユーザー一覧の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [authUser, selectedStoreId]); // filtersを依存配列から除外（filtersRef.currentを使用するため）

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const createUser = async (data: UserRequest) => {
    const isAdmin = authUser?.role?.toUpperCase() === 'ADMIN';
    if (isAdmin) {
      await adminUsersApi.createUser(data);
    } else {
      const currentStores = storesRef.current;
      const storeId = Array.isArray(authUser?.storeIds) && authUser.storeIds.length > 0
        ? authUser.storeIds[0]
        : (currentStores && currentStores.length > 0 ? currentStores[0].id : null);
      if (!storeId) {
        throw new Error('店舗IDが取得できませんでした');
      }
      await managerUsersApi.createUser(storeId, data);
    }
    await refetchUsers();
  };

  const updateUser = async (id: string, data: UserRequest) => {
    const isAdmin = authUser?.role?.toUpperCase() === 'ADMIN';
    if (isAdmin) {
      await adminUsersApi.updateUser(id, data);
    } else {
      const currentStores = storesRef.current;
      const storeId = Array.isArray(authUser?.storeIds) && authUser.storeIds.length > 0
        ? authUser.storeIds[0]
        : (currentStores && currentStores.length > 0 ? currentStores[0].id : null);
      if (!storeId) {
        throw new Error('店舗IDが取得できませんでした');
      }
      await managerUsersApi.updateUser(storeId, id, data);
    }
    await refetchUsers();
  };

  const deleteUser = async (id: string) => {
    const isAdmin = authUser?.role?.toUpperCase() === 'ADMIN';
    if (isAdmin) {
      await adminUsersApi.deleteUser(id);
    } else {
      const currentStores = storesRef.current;
      const storeId = Array.isArray(authUser?.storeIds) && authUser.storeIds.length > 0
        ? authUser.storeIds[0]
        : (currentStores && currentStores.length > 0 ? currentStores[0].id : null);
      if (!storeId) {
        throw new Error('店舗IDが取得できませんでした');
      }
      await managerUsersApi.deleteUser(storeId, id);
    }
    await refetchUsers();
  };

  return {
    users,
    total,
    loading,
    error,
    filters,
    handleFilterChange,
    setFilters,
    refetchUsers,
    createUser,
    updateUser,
    deleteUser,
  };
};

export default useUser;