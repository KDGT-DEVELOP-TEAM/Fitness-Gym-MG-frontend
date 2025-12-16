export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'trainer';
  createdAt: string; // DBスキーマでNOT NULL
  // updatedAt: DBスキーマに存在しないため削除
}

export interface UserFormData {
  email: string;
  name: string;
  password?: string;
  role: 'admin' | 'manager' | 'trainer';
  shopId?: string;
}

