import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../supabase/supabaseClient';
import { User, UserFormData } from '../types/user'; 

interface UserFilters {
  nameOrKana: string;
  role: string;
}

const useUsers = () => {
    const [allUsers, setAllUsers] = useState<User[]>([]); 
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<UserFilters>({ nameOrKana: '', role: 'all' });

    // --- ヘルパー: 共通のエラーハンドリング ---
    const handleError = (err: any, customMessage: string) => {
        console.error(`${customMessage}:`, err);
        setError(`${customMessage}: ${err.message || err}`);
        throw err;
    };

    // --- 1. データ取得 (Read) ---
    const fetchAllUsers = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error: fetchError } = await supabase
                .from('users')
                .select('id, name, kana, email, role, is_active, created_at, user_stores(store_id)')
                .order('created_at', { ascending: false });
                
            if (fetchError) throw fetchError;

            setAllUsers(data.map((user: any) => ({ 
                id: user.id,
                email: user.email || '',
                name: user.name,
                kana: user.kana,
                role: user.role,
                storeId: user.user_stores?.map((us: any) => us.store_id) || [],
                isActive: user.is_active,
                createdAt: user.created_at,
            })));
        } catch (err) {
            handleError(err, 'ユーザー一覧の取得に失敗しました');
        } finally {
            setLoading(false);
        }
    }, []);

    // --- 2. 新規作成 (Create) ---
    const createUser = async (formData: UserFormData) => { 
        try {
            const { data: newUser, error: userError } = await supabase
                .from('users')
                .insert([{
                    name: formData.name,
                    kana: formData.kana,
                    email: formData.email,
                    role: formData.role,
                    is_active: formData.isActive ?? true,
                    pass: formData.pass,
                }])
                .select().single();

            if (userError) throw userError;

            if (formData.storeId?.length) {
                const { error: storeError } = await supabase
                    .from('user_stores')
                    .insert(formData.storeId.map(sid => ({ user_id: newUser.id, store_id: sid })));
                if (storeError) throw storeError;
            }
            await fetchAllUsers();
        } catch (err) {
            handleError(err, 'ユーザーの作成に失敗しました');
        }
    };
    
    // --- 3. 更新 (Update) ---
    const updateUser = async (formData: UserFormData, userId: string) => { 
        try {
            // 更新用データの構築
            const updatePayload: any = {
                name: formData.name,
                kana: formData.kana,
                email: formData.email,
                role: formData.role,
                is_active: formData.isActive ?? true
            };
            if (formData.pass?.trim()) updatePayload.pass = formData.pass;

            const { data, error: userError } = await supabase
                .from('users')
                .update(updatePayload)
                .eq('id', userId)
                .select();

            if (userError) throw userError;
            if (!data?.length) throw new Error('更新対象のユーザーが見つかりません');

            // 店舗紐付け（削除 -> 挿入）
            await supabase.from('user_stores').delete().eq('user_id', userId);
            if (formData.storeId?.length) {
                await supabase.from('user_stores').insert(
                    formData.storeId.map(sid => ({ user_id: userId, store_id: sid }))
                );
            }
            await fetchAllUsers();
        } catch (err) {
            handleError(err, 'ユーザーの更新に失敗しました');
        }
    };

    // --- 4. 削除 (Delete) ---
    const deleteUser = async (userId: string) => { 
        try {
            // 中間テーブルはCASCADE設定が理想ですが、念のため手動削除
            await supabase.from('user_stores').delete().eq('user_id', userId);
            const { error } = await supabase.from('users').delete().eq('id', userId);
            if (error) throw error;
            await fetchAllUsers();
        } catch (err) {
            handleError(err, 'ユーザーの削除に失敗しました');
        }
    };

    // --- フィルタリング ---
    const users = useMemo(() => {
        const query = filters.nameOrKana.toLowerCase();
        return allUsers.filter(user => {
            const roleMatch = filters.role === 'all' || user.role === filters.role;
            const nameMatch = user.name.toLowerCase().includes(query) ||
                              (user.kana || '').toLowerCase().includes(query);
            return roleMatch && nameMatch;
        });
    }, [allUsers, filters]);

    useEffect(() => { fetchAllUsers(); }, [fetchAllUsers]);

    return { 
        users, loading, error, filters,
        handleFilterChange: (newFilters: Partial<UserFilters>) => setFilters(prev => ({ ...prev, ...newFilters })),
        getUserById: (id: string) => allUsers.find(u => u.id === id),
        refetchUsers: fetchAllUsers,
        createUser, updateUser, deleteUser,
    };
};

export default useUsers;