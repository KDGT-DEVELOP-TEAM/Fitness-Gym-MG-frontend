/**
 * 性別（バックエンドのGender Enumに対応）
 * バックエンドはJacksonデフォルトでEnum名をシリアライズするため、MALE/FEMALEを使用
 */
export type Gender = 'MALE' | 'FEMALE';

export interface Customer {
  id: string;
  kana: string;
  name: string;
  gender: Gender;
  birthdate: string; // バックエンドのCustomerResponse.birthdateに対応（birthdayから変換される）
  age: number; // バックエンドのCustomerResponse.age（計算値）
  height: number;
  email: string;
  phone: string;
  address: string;
  firstPostureGroupId: string | null;
  latestWeight: number | null; // バックエンドのCustomerResponse.latestWeight（getCustomerByIdでのみ設定される）
  medical: string | null; // バックエンドのCustomerResponse.medical（任意フィールド）
  taboo: string | null; // バックエンドのCustomerResponse.taboo（任意フィールド）
  memo: string | null; // バックエンドのCustomerResponse.memo（任意フィールド）
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
  /**
   * 有効/無効フラグ
   * デフォルト値: true（バックエンドのCustomerRequest.active = trueに対応）
   */
  active?: boolean; // デフォルト: true

  /**
   * 店舗ID
   * ADMINの場合: 不要（送信しない）。顧客は店舗に紐づかない。
   * MANAGERの場合: パス変数から取得されるため、リクエストボディでは不要。
   * 店舗と紐付くのはLessonであり、顧客自体は店舗に紐づかない。
   * ただし、MANAGERが作成する顧客は検索・フィルタリングのため店舗と紐付ける。
   */
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
    /**
     * ソート順
     * バックエンドのCustomerSort Enumに対応（KANA: かな順昇順, CREATED: 作成日時順降順）
     * デフォルト値: "created"（バックエンドのCustomerApiControllerのdefaultValueに合わせる）
     */
    sort?: 'KANA' | 'CREATED';
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