import { useState, useCallback, useEffect } from 'react';
import { adminUsersApi, UserListParams } from '../api/admin/usersApi';
import { User } from '../types/user';

export const useUser = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({ nameOrKana: '', role: 'all' });

  // ページ番号を受け取れるように修正
  const refetchUsers = useCallback(async (page: number = 0) => {
    setLoading(true);
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
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const handleFilterChange = (newFilters: any) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // 作成・更新・削除ロジック (APIを呼ぶだけ)
  const createUser = async (data: any) => await adminUsersApi.createUser(data);
  const updateUser = async (data: any, id: string) => await adminUsersApi.updateUser(id, data);
  const deleteUser = async (id: string) => await adminUsersApi.deleteUser(id);

  return { 
    users, total, loading, error, filters, 
    handleFilterChange, refetchUsers, 
    createUser, updateUser, deleteUser 
  };
};

export default useUser;