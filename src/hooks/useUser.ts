import { useState, useCallback } from 'react';
import { adminUsersApi } from '../api/admin/usersApi';
import { User, UserRequest, UserListParams } from '../types/api/user';
import { UserFilters } from '../types/form/user';

export const useUser = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<UserFilters>({
    nameOrKana: '',
    role: 'all',
  });

  const refetchUsers = useCallback(async (page = 0) => {
    setLoading(true);
    setError(null);
    try {
      const params: UserListParams = {
        page,
        size: 10,
        name: filters.nameOrKana || undefined,
        role: filters.role !== 'all' ? filters.role : undefined,
      };
      const res = await adminUsersApi.getUsers(params);
      setUsers(res.data);
      setTotal(res.total);
    } catch (e) {
      setError('ユーザー一覧の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const createUser = async (data: UserRequest) => {
    await adminUsersApi.createUser(data);
    await refetchUsers();
  };

  const updateUser = async (id: string, data: UserRequest) => {
    await adminUsersApi.updateUser(id, data);
    await refetchUsers();
  };

  const deleteUser = async (id: string) => {
    await adminUsersApi.deleteUser(id);
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