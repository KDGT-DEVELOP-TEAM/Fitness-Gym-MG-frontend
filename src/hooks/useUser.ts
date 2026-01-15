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
  
  // storesとstoresLoadingをrefで保持
  const storesRef = useRef(stores);
  const storesLoadingRef = useRef(storesLoading);
  const refetchUsersRef = useRef<((page: number) => Promise<void>) | null>(null);
  
  useEffect(() => {
    storesRef.current = stores;
    storesLoadingRef.current = storesLoading;
  }, [stores, storesLoading]);

  const refetchUsers = useCallback(async (page = 0) => {
    // MANAGERロールの場合、storesの読み込みが完了するまで待つ
    const isAdmin = authUser?.role?.toUpperCase() === 'ADMIN';
    if (!isAdmin && storesLoadingRef.current) {
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
        // Managerの場合は権限フィルタを無効化（roleパラメータを送信しない）
        role: isAdmin && filters.role !== 'all' ? filters.role : undefined,
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
          // 店舗情報がまだ読み込み中の場合は、エラーを設定せずに早期リターン
          if (storesLoadingRef.current) {
            setLoading(true);
            setError(null);
            return;
          }
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
  }, [filters, authUser, selectedStoreId]); // storesとstoresLoadingを依存配列から削除、selectedStoreIdを追加

  // refetchUsersの最新バージョンをrefで保持
  useEffect(() => {
    refetchUsersRef.current = refetchUsers;
  }, [refetchUsers]);

  // MANAGERロールの場合、店舗情報の読み込み完了後に自動的にデータを取得
  // selectedStoreIdが指定されている場合は、その店舗のデータを取得
  const hasInitialFetchedRef = useRef(false);
  const previousSelectedStoreIdRef = useRef<string | undefined>(selectedStoreId);
  useEffect(() => {
    if (!authUser) return;
    const isAdmin = authUser.role?.toUpperCase() === 'ADMIN';
    const isManager = !isAdmin;
    
    // selectedStoreIdが変更された場合は、フラグをリセットして再取得
    if (selectedStoreId !== previousSelectedStoreIdRef.current) {
      hasInitialFetchedRef.current = false;
      previousSelectedStoreIdRef.current = selectedStoreId;
    }
    
    // 店舗情報が読み込み完了し、かつ店舗が存在する場合にユーザーデータを取得
    // 初回のみ実行する（重複実行を防ぐ）
    if (isManager && !storesLoading && stores.length > 0 && refetchUsersRef.current && !hasInitialFetchedRef.current) {
      // selectedStoreIdが指定されている場合、または初期値が設定されている場合のみ実行
      if (selectedStoreId || (Array.isArray(authUser.storeIds) && authUser.storeIds.length > 0) || stores.length > 0) {
        hasInitialFetchedRef.current = true;
        refetchUsersRef.current(0);
      }
    }
    
    // authUserが変わった場合は、フラグをリセット
    if (authUser) {
      const currentIsManager = authUser.role?.toUpperCase() !== 'ADMIN';
      if (!currentIsManager) {
        hasInitialFetchedRef.current = false;
      }
    }
  }, [authUser, storesLoading, stores, selectedStoreId]); // refetchUsersは依存配列に含めない（ref経由でアクセス）、selectedStoreIdを追加

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