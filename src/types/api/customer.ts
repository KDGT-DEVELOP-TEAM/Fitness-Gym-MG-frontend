export type Gender = '男' | '女';

export interface Customer {
  id: string;
  kana: string;
  name: string;
  gender: Gender;
  birthdate: string; // バックエンドのCustomerResponse.birthdateに対応（birthdayから変換される）
  height: number;
  email: string;
  phone: string;
  address: string;
  medical: string | null;
  taboo: string | null;
  firstPostureGroupId: string | null;
  memo: string | null;
  createdAt: string;
  active: boolean; // バックエンドのCustomerResponse.activeに対応
}

/**
 * バックエンドのCustomerRequestに対応する型
 * 顧客作成・更新時に使用
 */
export interface CustomerRequest {
  // 必須項目
  kana: string;
  name: string;
  gender: Gender;
  birthday: string; // ISO8601形式の日付文字列
  height: number;
  email: string;
  phone: string;
  address: string;

  // 任意項目
  medical?: string;
  taboo?: string;
  memo?: string;
  firstPostureGroupId?: string | null;
  active?: boolean; // デフォルト: true

  // 店舗ID（ADMINの場合は必須、MANAGERの場合はパス変数から取得されるため省略可能）
  storeId?: string;
}

export interface CustomerListItem {
    id: string;
    name: string;
    kana: string | null;
    birthdate: string; // バックエンドのCustomerResponse.birthdateに対応
    active: boolean; // バックエンドのCustomerResponse.activeに対応
  }
  
  export interface CustomerListParams {
    page?: number;
    size?: number;
    name?: string;
    // バックエンドが受け取らないパラメータを削除:
    // kana: バックエンドのCustomerApiControllerでは受け取らない
    // isActive: バックエンドのCustomerApiControllerでは受け取らない
  }

/**
 * バックエンドのVitalsHistoryResponse.VitalsDataに対応する型
 */
export interface VitalsData {
  date: string; // ISO8601形式の日時文字列（OffsetDateTime）
  weight: number | null;
  bmi: number | null;
}

/**
 * バックエンドのVitalsHistoryResponseに対応する型
 * 体重/BMI履歴レスポンス
 */
export interface VitalsHistory {
  data: VitalsData[];
}