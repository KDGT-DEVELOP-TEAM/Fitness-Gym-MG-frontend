import { UserRole } from './api/user';

export type { User } from './api/user';

export interface LoginCredentials {
  email: string;
  /**
   * パスワード（平文）
   * ⚠️ セキュリティ注意: このフィールドは平文パスワードを含みます。
   * ログ出力やデバッグ情報に含めないでください。
   */
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
  storeIds?: string[]; // 店舗IDリスト（MANAGER/TRAINERの場合）
  token: string;
}


