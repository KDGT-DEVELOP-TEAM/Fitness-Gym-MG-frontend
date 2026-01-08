import { UserRole } from './api/user';

export type { User } from './api/user';

export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * バックエンドのLoginResponseに対応する型
 * 認証成功時に返されるユーザー情報とJWTトークンを含む
 */
export interface LoginResponse {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  token: string;
}

/**
 * @deprecated LoginResponseを使用してください
 * 後方互換性のため残していますが、新しいコードではLoginResponseを使用してください
 */
export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
  };
  token: string;
}

