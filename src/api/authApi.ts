import bcrypt from 'bcryptjs';
import { supabase } from '../lib/supabase';
import { LoginCredentials, AuthResponse } from '../types/auth';
import { User } from '../types/user';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    if (!supabase) {
      throw new Error('Supabaseが設定されていません。');
    }
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', credentials.email)
      .single();

    if (error || !data) {
      throw new Error('メールアドレスまたはパスワードが正しくありません');
    }

    const hashed = (data as any).pass as string | undefined;
    if (!hashed) {
      throw new Error('メールアドレスまたはパスワードが正しくありません');
    }

    const ok = await bcrypt.compare(credentials.password, hashed);
    if (!ok) {
      throw new Error('メールアドレスまたはパスワードが正しくありません');
    }

    const mappedUser: User = {
      id: (data as any).id ?? '',
      email: (data as any).email ?? '',
      name: (data as any).name ?? (data as any).email ?? '',
      role: ((data as any).role as User['role']) ?? 'trainer',
      shopId: (data as any).shop_id,
      createdAt: (data as any).created_at,
      updatedAt: (data as any).updated_at,
    };
    return { user: mappedUser, token: '' };
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: async (): Promise<AuthResponse['user']> => {
    const raw = localStorage.getItem('user');
    if (!raw) {
      throw new Error('No user');
    }
    return JSON.parse(raw) as User;
  },
};
