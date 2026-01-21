import { Gender } from '../api/customer';

export interface CustomerFormData {
  name: string;
  kana: string;
  gender: Gender;
  birthday: string;
  height: string | number; // 入力中は文字列として保持、送信時は数値に変換
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