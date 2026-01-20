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
  birthdate: string; // バックエンドのCustomerResponse.birthdateに対応（Entityのbirthdayフィールドから変換される。HTMLフォームとの互換性のためバックエンドでは意図的にbirthdateという名前を使用）
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
  /**
   * フリガナ
   * バリデーション要件: 必須、最大100文字
   */
  kana: string;
  /**
   * 名前
   * バリデーション要件: 必須、最大100文字
   */
  name: string;
  /**
   * 性別
   * バリデーション要件: 必須（MALE/FEMALE）
   */
  gender: Gender;
  /**
   * 生年月日
   * ISO8601形式の日付文字列（バックエンドのCustomerRequest.birthdayに対応。EntityおよびRequestではbirthday、Responseではbirthdateと意図的に使い分けている）
   * バリデーション要件: 必須、過去の日付のみ有効（未来の日付は指定できない）
   */
  birthday: string;
  /**
   * 身長（cm）
   * バリデーション要件: 必須、50.0cm以上、300.0cm以下
   */
  height: number;
  /**
   * メールアドレス
   * バリデーション要件: 必須、有効なメールアドレス形式、最大255文字
   */
  email: string;
  /**
   * 電話番号
   * バリデーション要件: 必須、10文字以上15文字以下の数字のみ（ハイフンは含めない）
   */
  phone: string;
  /**
   * 住所
   * バリデーション要件: 必須、最大500文字
   */
  address: string;

  // 任意項目
  /**
   * 既往歴
   * バリデーション要件: 任意、最大100文字
   */
  medical?: string;
  /**
   * 禁忌事項
   * バリデーション要件: 任意、最大100文字
   */
  taboo?: string;
  /**
   * メモ
   * バリデーション要件: 任意、最大500文字
   */
  memo?: string;
  firstPostureGroupId?: string | null;
  /**
   * 有効/無効フラグ
   * デフォルト値: true（バックエンドのCustomerRequest.active = trueに対応）
   */
  active?: boolean; // デフォルト: true

  /**
   * 店舗ID
   * ADMINの場合: 任意（送信しない場合は店舗に紐付けない）
   * MANAGERの場合: リクエストボディで指定可能。指定された場合は認可チェックが実施される。
   * 注意: バックエンドではパス変数（storeIdFromPath）が優先され、nullの場合はリクエストボディのstoreIdを使用します。
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
    storeId?: string | null; // バックエンドのCustomerResponse.storeIdに対応（オプショナル）
    storeName?: string | null; // バックエンドのCustomerResponse.storeNameに対応（オプショナル）
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
    /**
     * 店舗ID
     * ADMINの場合: 店舗で絞り込む場合に指定（nullの場合は全店舗）
     * MANAGERの場合: パス変数として使用されるため、このパラメータは使用しない
     */
    storeId?: string;
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