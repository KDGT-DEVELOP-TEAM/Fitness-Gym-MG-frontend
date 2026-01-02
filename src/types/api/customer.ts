export type Gender = '男' | '女';

export interface Customer {
  id: string;
  kana: string;
  name: string;
  gender: Gender;
  birthday: string;
  height: number;
  email: string;
  phone: string;
  address: string;
  medical: string | null;
  taboo: string | null;
  firstPostureGroupId: string | null;
  memo: string | null;
  createdAt: string;
  isActive: boolean;
}

export interface CustomerRequest {
  name: string;
  kana: string;
  gender: Gender;
  birthday: string;
  height: number;
  email: string;
  phone: string;
  address: string;
  medical?: string;
  taboo?: string;
  memo?: string;
  isActive: boolean;
}

export interface CustomerListItem {
    id: string;
    name: string;
    kana: string | null;
    birthday: string;
    isActive: boolean;
  }
  
  export interface CustomerListParams {
    page?: number;
    size?: number;
    name?: string;
    kana?: string;
    isActive?: boolean;
  }

  export interface VitalRecord {
    measuredAt: string;
    height?: number;
    weight?: number;
    bodyFatRate?: number;
    }
  
    export interface VitalsHistory {
    customerId: string;
    records: VitalRecord[];
    }