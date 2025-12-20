// src/api/tempSupabaseAuthApi.ts
import { supabase } from '../supabase/supabaseClient';
import { User } from '../types/user';

/**
 * ログイン（Supabase Authを使用）
 */
export const login = async ({ email, password }: { email: string, password: string }) => {
    // Supabase Authでログイン。ここでBcryptの検証が自動で行われます。
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) throw new Error(error.message);

    return { 
        token: data.session?.access_token || '',
    };
};

/**
 * ログインユーザー情報の取得
 * AuthのIDを使って public.users から詳細を引く
 */
export const getCurrentUser = async (): Promise<User> => {
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !authUser) {
        throw new Error("セッションがありません。");
    }

    // トリガーによって同じIDで作成されている public.users のレコードを取得
    const { data: dbUser, error: dbError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

    if (dbError || !dbUser) {
        throw new Error("DBにユーザー詳細が見つかりません。");
    }

    return {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        kana: dbUser.kana,
        role: dbUser.role as User['role'],
        isActive: dbUser.isActive ?? true,
        storeId: dbUser.storeId || null,
        createdAt: dbUser.created_at,
    };
};

/**
 * 3. ログアウト
 */
export const logout = async () => {
    localStorage.removeItem('custom_session_user_id');
    window.location.href = '/login';
};