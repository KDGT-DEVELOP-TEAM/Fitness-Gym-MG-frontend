/**
 * ページネーション関連の定数
 * バックエンドのSpring Data JPA形式に合わせて定義
 */

/**
 * デフォルトのページ番号（0ベース）
 * バックエンドのPageRequest.of(page, size)に合わせる
 */
export const DEFAULT_PAGE = 0;

/**
 * デフォルトのページサイズ
 * バックエンドのデフォルト値に合わせる
 */
export const DEFAULT_PAGE_SIZE = 10;

/**
 * 最大ページサイズ
 * バックエンドの@Max(100)制約に合わせる
 */
export const MAX_PAGE_SIZE = 100;
