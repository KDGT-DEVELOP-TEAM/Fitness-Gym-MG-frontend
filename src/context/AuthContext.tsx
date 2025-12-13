import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types/auth';
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
  const [authLoading, setAuthLoading] = useState(true); // 認証初期化中
  const [actionLoading, setActionLoading] = useState(false); // アクション実行中（login/logoutなど）

  useEffect(() => {
    const init = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser) as User);
          return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
      setUser(null);
          return;
        }

        const userData = await authApi.getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      } finally {
    setAuthLoading(false);
      }
    };

    init();
  }, []);

  const login = async (email: string, password: string) => {
    setActionLoading(true);
    try {
      const response = await authApi.login({ email, password });
      setUser(response.user);
    } finally {
      setActionLoading(false);
    }
  };

  const logout = async () => {
    setActionLoading(true);
    try {
      await authApi.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      setUser(null);
    } finally {
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

