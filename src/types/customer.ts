export interface Customer {
  id: string;
  kana: string | null;
  name: string;
  gender: string;
  birthday: string; // ISO形式の文字列
  height: number | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  medical: string | null;
  taboo: string | null;
  firstPostureGroupId?: string | null;
  memo: string | null;
  createdAt: string;
  isActive: boolean;
}

export type CustomerFormData = Omit<Customer, 'id' | 'createdAt' >;
