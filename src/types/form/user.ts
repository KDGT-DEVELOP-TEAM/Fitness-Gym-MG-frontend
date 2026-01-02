import { User, UserRole } from '../api/user';

export interface UserFormData {
  email: string;
  name: string;
  kana: string;
  role: UserRole;
  storeIds: string[]; // フォーム内では常に配列として扱う
  pass: string;      // フォーム内では空文字等で保持する
}

export interface UserStatusUpdate {
    isActive: boolean;
}

export type UserFilters = {
    nameOrKana: string;
    role: User['role'] | 'all';
};