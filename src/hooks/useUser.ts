import { useState, useCallback } from 'react';
import { adminUsersApi } from '../api/admin/usersApi';
import { managerUsersApi } from '../api/manager/usersApi';
import { useAuth } from '../context/AuthContext';
import { useStores } from './useStore';
import { User, UserRequest, UserListParams } from '../types/api/user';
import { UserFilters } from '../types/form/user';

export const useUser = () => {
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

  const refetchUsers = useCallback(async (page = 0) => {
    // MANAGERロールの場合、storesの読み込みが完了するまで待つ
    const isAdmin = authUser?.role?.toUpperCase() === 'ADMIN';
    if (!isAdmin && storesLoading) {
      // storesLoading中はローディング状態を維持し、エラーメッセージは表示しない
      setLoading(true);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const params: UserListParams = {
        page,
        size: 10,
        name: filters.nameOrKana || undefined,
        role: filters.role !== 'all' ? filters.role : undefined,
      };
      
      // ロールに応じて適切なAPIを呼び出す
      let res;
      
      if (isAdmin) {
        res = await adminUsersApi.getUsers(params);
      } else {
        // MANAGERロールの場合、storeIdを取得
        const storeId = Array.isArray(authUser?.storeIds) && authUser.storeIds.length > 0
          ? authUser.storeIds[0]
          : (stores && stores.length > 0 ? stores[0].id : null);
        
        if (!storeId) {
          // storesLoadingが完了し、かつstoreIdが取得できない場合のみエラーメッセージを表示
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
  }, [filters, authUser, stores, storesLoading]);

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const createUser = async (data: UserRequest) => {
    const isAdmin = authUser?.role?.toUpperCase() === 'ADMIN';
    if (isAdmin) {
      await adminUsersApi.createUser(data);
    } else {
      const storeId = Array.isArray(authUser?.storeIds) && authUser.storeIds.length > 0
        ? authUser.storeIds[0]
        : (stores && stores.length > 0 ? stores[0].id : null);
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
      const storeId = Array.isArray(authUser?.storeIds) && authUser.storeIds.length > 0
        ? authUser.storeIds[0]
        : (stores && stores.length > 0 ? stores[0].id : null);
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
      const storeId = Array.isArray(authUser?.storeIds) && authUser.storeIds.length > 0
        ? authUser.storeIds[0]
        : (stores && stores.length > 0 ? stores[0].id : null);
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