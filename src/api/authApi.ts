import axiosInstance from './axiosConfig';
import { LoginCredentials, AuthResponse } from '../types/auth';
import { User } from '../types/user';
import { storage } from '../utils/storage';
import { handleApiError, logError } from '../utils/errorHandler';
import { logger } from '../utils/logger';

interface UserRawData {
  id?: string;
  email?: string;
  name?: string;
  role?: User['role'];
  createdAt?: string;
  created_at?: string;
  // updatedAt, updated_at: DBスキーマに存在しないため削除
  // shopId, shop_id: Usersテーブルにはstore_idカラムが存在しない（User_Storesテーブルで多対多関係を管理）
}

const mapUser = (raw: UserRawData | null | undefined): User => {
  if (!raw) {
    throw new Error('User data is required');
  }

  // createdAtはDBでNOT NULLのため、必須
  const createdAt = 'createdAt' in raw && raw.createdAt
    ? raw.createdAt
    : 'created_at' in raw && raw.created_at
    ? raw.created_at
    : new Date().toISOString(); // デフォルト値として現在時刻を使用

  return {
    id: raw.id ?? '',
    email: raw.email ?? '',
    name: raw.name ?? raw.email ?? '',
    role: (raw.role as User['role']) ?? 'trainer',
    createdAt, // DBでNOT NULL
    // updatedAt: DBスキーマに存在しないため削除
    // shopId: Usersテーブルにはstore_idカラムが存在しない（User_Storesテーブルで多対多関係を管理）
  };
};

/**
 * 認証API
 * ユーザー認証、ログイン、ログアウト、現在のユーザー情報取得を処理
 */
export const authApi = {
  /**
   * メールアドレスとパスワードでユーザーを認証
   * REST APIでJWTトークンを取得し、ユーザーデータを取得
   * 
   * @param credentials - ログイン認証情報（メールアドレスとパスワード）
   * @returns ユーザーとトークンを含む認証レスポンス
   * @throws 認証に失敗した場合にエラーを投げる
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      // REST APIでログイン
      const response = await axiosInstance.post<AuthResponse>('/auth/login', {
        email: credentials.email,
        password: credentials.password,
      });

      if (!response.data || !response.data.token || !response.data.user) {
        throw new Error('メールアドレスまたはパスワードが正しくありません');
      }

      const { token, user: userData } = response.data;

      // トークンを保存
      storage.setToken(token);

      // ユーザーデータをマッピングして保存
      const mappedUser = mapUser(userData);
      storage.setUser(mappedUser);

      logger.info('Login successful', { email: credentials.email }, 'authApi');
      return { user: mappedUser, token };
    } catch (error) {
      const appError = handleApiError(error);
      logError(appError, 'authApi.login');
      
      // 認証エラーの場合は統一メッセージを返す
      if (appError.statusCode === 401) {
        throw new Error('メールアドレスまたはパスワードが正しくありません');
      }
      
      throw new Error(appError.message || 'ログインに失敗しました');
    }
  },

  /**
   * 現在のユーザーをログアウト
   * REST APIにログアウトリクエストを送信し、ローカルストレージをクリア
   */
  logout: async (): Promise<void> => {
    try {
      // REST APIにログアウトリクエストを送信（オプション）
      await axiosInstance.post('/auth/logout').catch(() => {
        // ログアウトAPIが失敗しても続行（トークン削除は必須）
        logger.warn('Logout API call failed, but continuing with token removal', undefined, 'authApi');
      });
    } finally {
      storage.clear();
      logger.info('User logged out', undefined, 'authApi');
    }
  },

  /**
   * パスワードリセット用のメールを送信
   * 
   * @param email - パスワードリセット対象のメールアドレス
   * @throws Error if email sending fails
   */
  resetPassword: async (email: string): Promise<void> => {
    try {
      const redirectUrl = process.env.REACT_APP_PASSWORD_RESET_URL || `${window.location.origin}/reset-password`;
      
      await axiosInstance.post('/auth/reset-password', {
        email,
        redirectUrl,
      });

      logger.info('Password reset email sent', { email }, 'authApi');
    } catch (error) {
      const appError = handleApiError(error);
      logError(appError, 'authApi.resetPassword');
      throw new Error('パスワードリセットメールの送信に失敗しました');
    }
  },

  /**
   * パスワードを更新
   * 
   * @param newPassword - 新しいパスワード
   * @throws Error if password update fails
   */
  updatePassword: async (newPassword: string): Promise<void> => {
    try {
      await axiosInstance.put('/auth/password', {
        password: newPassword,
      });

      logger.info('Password updated successfully', undefined, 'authApi');
    } catch (error) {
      const appError = handleApiError(error);
      logError(appError, 'authApi.updatePassword');
      throw new Error('パスワードの更新に失敗しました');
    }
  },

  /**
   * 現在認証されているユーザーを取得
   * REST API `/auth/me`からユーザーデータを取得
   * 
   * @returns 現在のユーザーデータ
   * @throws 有効なトークンまたはユーザーデータが見つからない場合にエラーを投げる
   */
  getCurrentUser: async (): Promise<AuthResponse['user']> => {
    const token = storage.getToken();
    if (!token) {
      throw new Error('No token');
    }

    try {
      const { data } = await axiosInstance.get<UserRawData>('/auth/me');
      const mappedUser = mapUser(data);
      storage.setUser(mappedUser);
      logger.debug('Current user fetched from /auth/me', undefined, 'authApi');
      return mappedUser;
    } catch (error) {
      const appError = handleApiError(error);
      logError(appError, 'authApi.getCurrentUser');
      
      // 401エラーの場合はトークンをクリア
      if (appError.statusCode === 401) {
        storage.clear();
        throw new Error('認証が無効です。再度ログインしてください');
      }
      
      throw new Error(appError.message || 'ユーザー情報の取得に失敗しました');
    }
  },
};
