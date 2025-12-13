import { supabase } from '../lib/supabase';
import axiosInstance from './axiosConfig';
import { LoginCredentials, AuthResponse } from '../types/auth';
import { User } from '../types/user';

const mapUser = (raw: any): User => ({
  id: raw?.id ?? '',
  email: raw?.email ?? '',
  name: raw?.name ?? raw?.email ?? '',
  role: (raw?.role as User['role']) ?? 'trainer',
  shopId: raw?.shopId ?? raw?.shop_id,
  createdAt: raw?.createdAt ?? raw?.created_at,
  updatedAt: raw?.updatedAt ?? raw?.updated_at,
});

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    if (!supabase) {
      throw new Error('Supabaseが設定されていません。');
    }

    // 1) Supabase Authでログインし、アクセストークンを取得
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (authError || !authData.session?.access_token) {
      throw new Error('メールアドレスまたはパスワードが正しくありません');
    }

    const accessToken = authData.session.access_token;
    const authUserId = authData.user.id;
    localStorage.setItem('token', accessToken);

    // 2) バックエンド経由でユーザー情報取得を試み、失敗したらSupabase直叩きでフォールバック
    let userData: any | null = null;
    try {
      const res = await axiosInstance.post('/auth/login', { email: credentials.email });
      userData = res.data;
    } catch (err) {
      // /auth/login が失敗したら /auth/me を試す
      try {
        const res = await axiosInstance.get('/auth/me');
        userData = res.data;
      } catch (err2) {
        // バックエンドが起動していない場合は Supabase の users テーブルを直接参照
        try {
          const { data: directUser } = await supabase
            .from('users')
            .select('*')
            .eq('auth_user_id', authUserId)
            .single();
          if (directUser) {
            userData = directUser;
    }
        } catch (err3) {
          // 最終フォールバック: auth.user の情報のみで返す
          userData = {
            id: authData.user.id,
            email: authData.user.email,
            name: authData.user.email,
            role: 'trainer',
          };
        }
      }
    }

    const mappedUser = mapUser(userData);
    localStorage.setItem('user', JSON.stringify(mappedUser));

    return { user: mappedUser, token: accessToken };
  },

  logout: async (): Promise<void> => {
    try {
      if (supabase) {
        await supabase.auth.signOut();
      }
    } finally {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    }
  },

  getCurrentUser: async (): Promise<AuthResponse['user']> => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token');
    }

    // 1) バックエンド経由を試す
    try {
      const { data } = await axiosInstance.get('/auth/me');
      const mappedUser = mapUser(data);
      localStorage.setItem('user', JSON.stringify(mappedUser));
      return mappedUser;
    } catch {
      // 2) Supabaseセッションから直接取得（バックエンド停止時のフォールバック）
      if (!supabase) throw new Error('Supabaseが設定されていません。');
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
      throw new Error('No user');
    }
      // usersテーブルを優先して参照
      try {
        const { data: directUser } = await supabase
          .from('users')
          .select('*')
          .eq('auth_user_id', session.user.id)
          .single();
        if (directUser) {
          const mappedUser = mapUser(directUser);
          localStorage.setItem('user', JSON.stringify(mappedUser));
          return mappedUser;
        }
      } catch {
        // 最終フォールバック: セッションユーザーだけで組み立て
        const fallback = mapUser({
          id: session.user.id,
          email: session.user.email,
          name: session.user.email,
          role: 'trainer',
        });
        localStorage.setItem('user', JSON.stringify(fallback));
        return fallback;
      }
      throw new Error('ユーザー情報が見つかりません');
    }
  },
};
