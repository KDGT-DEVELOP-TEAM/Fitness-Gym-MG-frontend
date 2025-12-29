import { useState, useCallback, useEffect } from 'react';
import { adminUsersApi } from '../api/admin/usersApi';
import { User, UserFormData, UserListParams } from '../types/user';

export const useUser = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<{ nameOrKana: string; role: User['role'] | 'all' }>({ nameOrKana: '', role: 'all' });

  // ページ番号を受け取れるように修正
  const refetchUsers = useCallback(async (page: number = 0) => {
    setLoading(true);
    setError(null);
    try {
      const params: UserListParams = {
        page,
        size: 10,
        name: filters.nameOrKana || undefined,
        role: filters.role !== 'all' ? filters.role : undefined
      };
      const response = await adminUsersApi.getUsers(params);
      setUsers(response.data);
      setTotal(response.total);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError('不明なエラーが発生しました');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // 作成・更新・削除ロジック (APIを呼ぶだけ)
  const createUser = async (data: UserFormData) => await adminUsersApi.createUser(data);
  const updateUser = async (data: UserFormData, id: string) => await adminUsersApi.updateUser(id, data);
  const deleteUser = async (id: string) => await adminUsersApi.deleteUser(id);

  return { 
    users, total, loading, error, filters, 
    handleFilterChange, refetchUsers, 
    createUser, updateUser, deleteUser 
  };
};

export default useUser;