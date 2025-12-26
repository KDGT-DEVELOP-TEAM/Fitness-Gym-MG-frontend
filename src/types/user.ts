export interface User {
  id: string; 
  email: string; 
  name: string; 
  kana: string | null;
  role: 'ADMIN' | 'TRAINER' | 'MANAGER' | string;
  storeId: string[] | null;
  isActive: boolean; 

  createdAt?: string;
}

export interface UserFormData {
  email: string;
  name: string;
  kana: string | null;
  pass?: string;
  role: 'ADMIN' | 'TRAINER' | 'MANAGER';
  storeId: string[] | null;
  isActive?: boolean; 
}
