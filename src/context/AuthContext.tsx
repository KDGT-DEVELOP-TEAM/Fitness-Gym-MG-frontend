import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types/auth';
import { authApi } from '../api/authApi';

interface AuthContextType {
  user: User | null;
  authLoading: boolean;
  actionLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
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
      try {
        // getCurrentUser()の成否のみで認証状態を判断
        const currentUser = await authApi.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        // 認証失敗時はnullに設定
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setActionLoading(true);
    try {
      // authApi側でtoken保存まで完結
      await authApi.login({ email, password });

      // getCurrentUser()で認証を確定
      const currentUser = await authApi.getCurrentUser();
      setUser(currentUser);

      return currentUser;
    } catch (error) {
      console.error('ログインに失敗しました:', error);
      throw error;
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
