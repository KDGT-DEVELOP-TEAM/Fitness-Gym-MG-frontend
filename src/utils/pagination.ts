/**
 * ページネーション関連のユーティリティ関数
 * Spring Data JPA形式のPage<T>からフロントエンド形式のPaginatedResponse<T>に変換
 */

/**
 * Spring Data JPA形式のページネーションレスポンス
 */
export interface SpringPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

/**
 * フロントエンド形式のページネーションレスポンス
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Spring Data JPA形式のPage<T>からフロントエンド形式のPaginatedResponse<T>に変換
 * @param springPage Spring Data JPA形式のページネーションレスポンス
 * @returns フロントエンド形式のページネーションレスポンス
 */
export function convertPageResponse<T>(springPage: SpringPage<T>): PaginatedResponse<T> {
  return {
    data: springPage.content,
    total: springPage.totalElements,
    page: springPage.number,
    limit: springPage.size,
  };
}
