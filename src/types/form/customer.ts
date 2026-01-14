import { Gender } from '../api/customer';

export interface CustomerFormData {
  name: string;
  kana: string;
  gender: Gender;
  birthday: string;
  height: number;
  email: string;
  phone: string;
  address: string;
  medical: string;
  taboo: string;
  memo: string;
  storeId?: string;
}

export interface CustomerStatusUpdate {
    isActive: boolean;
}

export type CustomerFilters = {
    nameOrKana: string;
};