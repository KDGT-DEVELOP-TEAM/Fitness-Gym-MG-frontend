/**
 * Time constants in seconds
 * Used for signed URL expiration and other time-based operations
 * 
 * ⚠️ 重要: 署名付きURL関連の定数はバックエンドのApplicationConstantsと完全に一致させること
 * 値が変更された場合、フロントエンドとバックエンドで不整合が発生し、
 * バリデーションエラーや予期しない動作の原因となる可能性があります。
 * 
 * バックエンド参照: com.example.fitnessgym_mg.config.ApplicationConstants
 */

export const TIME_CONSTANTS = {
  ONE_HOUR_IN_SECONDS: 3600,
  ONE_DAY_IN_SECONDS: 86400,
  SEVEN_DAYS_IN_SECONDS: 604800,
} as const;

/**
 * 署名付きURL関連の定数
 * バックエンドのApplicationConstantsと完全に一致させること
 */
export const SIGNED_URL_CONSTANTS = {
  /**
   * デフォルトの署名付きURL有効期限（秒）
   * バックエンドのApplicationConstants.DEFAULT_SIGNED_URL_EXPIRES_INと一致させること
   * バックエンド値: 3600（1時間）
   */
  DEFAULT_EXPIRES_IN: 3600,
  
  /**
   * 最小の署名付きURL有効期限（秒）
   * バックエンドのApplicationConstants.MIN_SIGNED_URL_EXPIRES_INと一致させること
   * バックエンド値: 60（60秒）
   * 
   * 注意: この値未満の有効期限を指定すると、バックエンドでバリデーションエラーが発生します。
   */
  MIN_EXPIRES_IN: 60,
  
  /**
   * 最大の署名付きURL有効期限（秒）
   * バックエンドのApplicationConstants.MAX_SIGNED_URL_EXPIRES_INと一致させること
   * バックエンド値: 604800（7日）
   * 
   * 注意: この値を超える有効期限を指定すると、バックエンドでバリデーションエラーが発生します。
   */
  MAX_EXPIRES_IN: 604800,
  
  /**
   * バッチ署名付きURL生成の最大件数
   * バックエンドのApplicationConstants.MAX_BATCH_SIGNED_URL_COUNTと一致させること
   * バックエンド値: 50
   * 
   * 署名URL生成はCPU/I/Oコストが高い処理のため、件数制限が設けられています。
   * この値を超える件数を指定すると、バックエンドでバリデーションエラーが発生します。
   */
  MAX_BATCH_COUNT: 50,
} as const;
