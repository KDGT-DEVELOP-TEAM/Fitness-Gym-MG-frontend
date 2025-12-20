export interface User {
  id: string; 
  email: string; 
  name: string; 
  kana: string | null;
  role: 'admin' | 'trainer' | 'manager' | string;
  storeId: string[] | null;
  isActive: boolean; 

  createdAt?: string;
}

export interface UserFormData {
  email: string;
  name: string;
  kana: string | null;
  pass?: string;
  role: 'admin' | 'trainer' | 'manager';
  storeId: string[] | null;
  isActive?: boolean; 
}
