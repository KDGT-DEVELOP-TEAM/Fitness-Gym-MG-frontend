import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import { User } from '../types/auth';
import { authApi } from '../api/authApi';
import { storage } from '../utils/storage';
import { isTokenValid } from '../utils/jwt';
import { transformLoginResponseToUser } from '../utils/authTransformers';
import { logger } from '../utils/logger';
import { AxiosError } from 'axios';

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
        // トークンが存在し、有効期限が切れていない場合のみ認証状態を確認
        const token = storage.getToken();
        if (!token) {
          // トークンがない場合は認証されていない
          setUser(null);
          setAuthLoading(false);
          return;
        }

        // トークンの有効期限をチェック
        if (!isTokenValid(token)) {
          // トークンが期限切れの場合は削除
          logger.debug('トークンが期限切れのため削除', undefined, 'AuthContext');
          storage.clear();
          setUser(null);
          setAuthLoading(false);
          return;
        }
        
        // getCurrentUser()の成否のみで認証状態を判断
        const currentUser = await authApi.getCurrentUser();
        setUser(currentUser);
      } catch (error: unknown) {
        const axiosError = error as AxiosError;
        // 401エラー（未認証）は正常な動作なので、エラーをログに出力しない
        // その他のエラーのみログに出力
        if (axiosError?.response?.status !== 401) {
          logger.error('認証状態の確認に失敗しました', error, 'AuthContext');
        }
        // 認証失敗時はnullに設定
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<User> => {
    setActionLoading(true);
    try {
      logger.debug('ログイン開始', undefined, 'AuthContext');
      const loginResponse = await authApi.login({ email, password });
      logger.debug('ログインAPI成功', { userId: loginResponse.userId }, 'AuthContext');
      
      // トークンを保存（ストレージ操作をAuthContextで行う）
      storage.setToken(loginResponse.token);
      storage.setUser({
        userId: loginResponse.userId,
        email: loginResponse.email,
        name: loginResponse.name,
        role: loginResponse.role,
      });
      
      // LoginResponseからUser型に変換
      const user = transformLoginResponseToUser(loginResponse);
      
      logger.debug('User型に変換完了', { userId: user.id }, 'AuthContext');
      setUser(user);
      return user;
    } catch (error) {
      logger.error('ログインに失敗しました', error, 'AuthContext');
      throw error;
    } finally {
      setActionLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setActionLoading(true);
    try {
      await authApi.logout();
    } catch (error) {
      // ログアウトAPIが失敗してもローカルの状態はクリア
      logger.error('ログアウトAPIが失敗しました', error, 'AuthContext');
    } finally {
      // ストレージ操作をAuthContextで行う
      storage.clear();
      setUser(null);
      setActionLoading(false);
    }
  }, []);

  // Contextのvalueをメモ化して不要な再レンダリングを防ぐ
  const contextValue = useMemo(
    () => ({
      user,
      authLoading,
      actionLoading,
      login,
      logout,
      isAuthenticated: !!user, // userがあれば認証済み
    }),
    [user, authLoading, actionLoading, login, logout]
  );

  return (
    <AuthContext.Provider value={contextValue}>
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
