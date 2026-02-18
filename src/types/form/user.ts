import { User, UserRole } from '../api/user';

export interface UserFormData {
  email: string;
  name: string;
  kana: string;
  role: UserRole;
  storeId?: string; // ユーザーは1つの店舗にのみ所属可能（ラジオボタンで選択）
  pass: string;      // フォーム内では空文字等で保持する
}

export interface UserStatusUpdate {
    isActive: boolean;
}

export type UserFilters = {
    nameOrKana: string;
    role: User['role'] | 'all';
};