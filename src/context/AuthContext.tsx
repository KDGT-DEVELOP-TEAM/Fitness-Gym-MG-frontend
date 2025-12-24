import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../api/authApi';
import { storage } from '../utils/storage';
import { logger } from '../utils/logger';

interface User {
  userId: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'MANAGER' | 'TRAINER';
}

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

  useEffect(() => {
    const init = async () => {
      try {
        // セッションCookieの確認
        const userData = await authApi.checkAuth();
        setUser(userData);
        storage.setUser(userData); // オプショナル
      } catch (error) {
        logger.debug('No active session', {}, 'AuthContext');
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
      const userData = await authApi.login({ email, password });
      setUser(userData);
      storage.setUser(userData); // オプショナル
    } catch (error) {
      logger.error('Login failed', error, 'AuthContext');
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  const logout = async () => {
    setActionLoading(true);
    try {
      await authApi.logout();
      setUser(null);
      storage.clear();
    } catch (error) {
      logger.error('Logout failed', error, 'AuthContext');
      throw error;
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
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
