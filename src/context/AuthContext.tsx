import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types/user';
// import { authApi } from '../api/authApi';
import * as authApi from '../api/tempSupabaseAuthApi'; // 🔑 代替APIをインポート
import { supabase } from '../supabase/supabaseClient';

interface AuthContextType {
  user: User | null;
  authLoading: boolean;
  actionLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true); // 認証初期化中
  const [actionLoading, setActionLoading] = useState(false); // アクション実行中（login/logoutなど）

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');

      if (token) {
        try {
          // getCurrentUser()が成功して初めて認証済みと判断
          const currentUser = await authApi.getCurrentUser();
          setUser(currentUser);
        } catch (error) {
          // トークンがあっても getCurrentUser() が失敗したら未認証
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
      setAuthLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setActionLoading(true);
    try {
      // ログイン実行
      const response = await authApi.login({ email, password });
      localStorage.setItem('token', response.token);

      // getCurrentUser()で認証を確定
      const currentUser = await authApi.getCurrentUser();
      setUser(currentUser);
      localStorage.setItem('user', JSON.stringify(currentUser));
    } finally {
      setActionLoading(false);
    }
  };

  const logout = async () => {
    setActionLoading(true);
    try {
      await authApi.logout();
    } catch (error) {
      // ログアウトAPIが失敗してもローカルの状態はクリア
      console.error('Logout API failed:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setActionLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        authLoading,
        actionLoading,
        login,
        logout,
        isAuthenticated: !!user, // userがあれば認証済み
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

