/**
 * ページネーション関連の定数
 * バックエンドのSpring Data JPA形式に合わせて定義
 * 
 * 重要: 以下の定数はバックエンドのApplicationConstantsと一致させること
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
 * 最大ページサイズ
 * バックエンドのApplicationConstants.MAX_PAGE_SIZEと一致させること
 * バックエンド値: 100
 */
export const MAX_PAGE_SIZE = 100;
