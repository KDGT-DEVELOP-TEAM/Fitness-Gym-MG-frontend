export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'instructor' | 'staff' | string;
  shopId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserFormData {
  email: string;
  name: string;
  password?: string;
  role: 'admin' | 'instructor' | 'staff';
  shopId?: string;
}

