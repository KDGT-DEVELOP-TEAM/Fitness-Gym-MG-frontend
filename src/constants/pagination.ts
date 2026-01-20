/**
 * ページネーション関連の定数
 * バックエンドのSpring Data JPA形式に合わせて定義
 * 
 * ⚠️ 重要: 以下の定数はバックエンドのApplicationConstantsと完全に一致させること
 * 値が変更された場合、フロントエンドとバックエンドで不整合が発生し、
 * バリデーションエラーや予期しない動作の原因となる可能性があります。
 * 
 * バックエンド参照: com.example.fitnessgym_mg.config.ApplicationConstants
 */

/**
 * デフォルトのページ番号（0ベース）
 * バックエンドのApplicationConstants.DEFAULT_PAGE_NUMBERと一致させること
 * バックエンド値: 0
 */
export const DEFAULT_PAGE = 0;

/**
 * デフォルトのページサイズ
 * バックエンドのApplicationConstants.DEFAULT_PAGE_SIZEと一致させること
 * バックエンド値: 10
 */
export const DEFAULT_PAGE_SIZE = 10;

/**
 * 最小ページサイズ
 * バックエンドのApplicationConstants.MIN_PAGE_SIZEと一致させること
 * バックエンド値: 1
 */
export const MIN_PAGE_SIZE = 1;

/**
 * 最大ページサイズ
 * バックエンドのApplicationConstants.MAX_PAGE_SIZEと一致させること
 * バックエンド値: 100
 * 
 * 注意: この値を超えるページサイズを指定すると、バックエンドでバリデーションエラーが発生します。
 */
export const MAX_PAGE_SIZE = 100;

/**
 * 最大ページ番号
 * バックエンドのApplicationConstants.MAX_PAGE_NUMBERと一致させること
 * バックエンド値: 1000
 * 
 * 巨大なOFFSETクエリを防ぐため、1000ページまでに制限されています。
 * この値を超えるページ番号を指定すると、バックエンドでバリデーションエラーが発生します。
 */
export const MAX_PAGE_NUMBER = 1000;

/**
 * 最大オフセット値
 * バックエンドのApplicationConstants.MAX_OFFSETと一致させること
 * バックエンド値: 10000L
 * 
 * page × size がこの値を超える場合、バックエンドでInvalidRequestExceptionがスローされます。
 * 巨大なOFFSETクエリによるDB負荷を防ぐため、10000件までに制限されています。
 */
export const MAX_OFFSET = 10000;
