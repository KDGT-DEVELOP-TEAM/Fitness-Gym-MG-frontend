export type UserRole = 'ADMIN' | 'TRAINER' | 'MANAGER';
export interface User {
  id: string; 
  email: string; 
  name: string; 
  kana: string | null;
  role: UserRole;
  storeId: string[] | null;
  isActive: boolean; 

  createdAt: string;
  updatedAt: string;
}

export type UserFormData = Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'isActive'> & {
  pass?: string; // パスワードは任意（更新時は入力しない場合があるため）
}

export interface UserStatusUpdate {
  isActive: boolean;
}

export interface UserListItem {
  id: string;
  name: string;
  kana: string | null;
  role: UserRole;
  isActive: boolean;
}