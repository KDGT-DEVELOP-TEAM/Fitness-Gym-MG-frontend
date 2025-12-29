import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { User } from '../types/user';
import { authApi } from '../api/authApi'; 

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
  const [authLoading, setAuthLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // 1. 初期化ロジック (useEffect内)
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const currentUser = await authApi.checkAuth();
          setUser(currentUser);
        } catch (error: unknown) {
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setAuthLoading(false);
    };
    initAuth();
  }, []);

  // 2. ログインロジック
  const login = async (email: string, password: string) => {
    setActionLoading(true);
    try {
      const userData = await authApi.login({ email, password });
      setUser(userData);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('Login failed:', error.response?.data?.message || error.message);
      }
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  // 3. ログアウトロジック
  const logout = async () => {
    setActionLoading(true);
    try {
      // サーバー側でトークン無効化処理などが必要な場合は呼び出し
      await authApi.logout();
    } catch (error: unknown) {
      console.error('Logout API failed:', error);
    } finally {
      // APIの成否に関わらず、フロント側の認証情報は必ずクリアする
      localStorage.removeItem('token');
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
        isAuthenticated: !!user,
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