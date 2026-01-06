export type UserRole = 'ADMIN' | 'MANAGER' | 'TRAINER';

/**
 * バックエンドのUserResponseに対応する型
 * ユーザー詳細（レスポンス用）
 */
export interface User {
  id: string;
  email: string;
  name: string;
  kana: string;
  role: UserRole;
  storeIds: string[]; // バックエンドはSet<UUID>、空の場合は空Set（nullではなく空配列）
  active: boolean; // バックエンドはactiveフィールド
  createdAt: string;
}

/**
 * ユーザー作成・更新用リクエスト
 */
export interface UserRequest {
  email: string;
  name: string;
  kana: string;
  role: UserRole;
  /**
   * 店舗ID
   * ADMIN: 不要 / MANAGER: 必須（1つ） / TRAINER: 任意（0個以上）
   */
  storeIds?: string[];
  /**
   * パスワード
   * 作成時: 必須 / 更新時: 任意（未指定なら更新しない）
   */
  pass?: string;
  /**
   * 有効 / 無効（バックエンドはactiveフィールド）
   * デフォルト値: true（バックエンドのUserRequest.active = trueに対応）
   */
  active?: boolean;
}

export interface UserListItem {
    id: string;
    name: string;
    kana: string;
    role: UserRole;
    active: boolean;
  }

export interface UserListParams {
  page?: number;
  size?: number;
  name?: string;
  role?: UserRole;
  // バックエンドが受け取らないパラメータを削除:
  // active: バックエンドのUserApiControllerでは受け取らない
}