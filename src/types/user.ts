export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'trainer';
  shopId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserFormData {
  email: string;
  name: string;
  password?: string;
  role: 'admin' | 'manager' | 'trainer';
  shopId?: string;
}

