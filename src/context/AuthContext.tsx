import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types/auth';
import { authApi } from '../api/authApi';
import { storage } from '../utils/storage';

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
        // トークンが存在する場合のみ認証状態を確認
        const token = storage.getToken();
        if (!token) {
          // トークンがない場合は認証されていない
          setUser(null);
          setAuthLoading(false);
          return;
        }
        
        // getCurrentUser()の成否のみで認証状態を判断
        const currentUser = await authApi.getCurrentUser();
        setUser(currentUser);
      } catch (error: any) {
        // 401エラー（未認証）は正常な動作なので、エラーをログに出力しない
        // その他のエラーのみログに出力
        if (error?.response?.status !== 401) {
          console.error('認証状態の確認に失敗しました:', error);
        }
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
      // login()のレスポンスから直接User型を作成
      // authApi側でtoken保存まで完結
      console.log('[AuthContext] ログイン開始');
      const loginResponse = await authApi.login({ email, password });
      console.log('[AuthContext] ログインAPI成功:', loginResponse);
      
      // LoginResponseからUser型に変換
      const user: User = {
        id: loginResponse.userId,
        email: loginResponse.email,
        name: loginResponse.name,
        kana: '', // LoginResponseにはkanaが含まれていないため空文字
        role: loginResponse.role,
        storeIds: [], // LoginResponseにはstoreIdsが含まれていないため空配列
        active: true, // LoginResponseにはactiveが含まれていないためtrueと仮定
        createdAt: '',
      };
      
      console.log('[AuthContext] User型に変換完了:', user);
      setUser(user);
      console.log('[AuthContext] setUser完了');
      return user;
    } catch (error) {
      console.error('[AuthContext] ログインに失敗しました:', error);
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
