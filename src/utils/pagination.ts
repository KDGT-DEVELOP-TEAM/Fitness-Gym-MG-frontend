/**
 * ページネーション関連のユーティリティ関数
 * Spring Data JPA形式のPage<T>からフロントエンド形式のPaginatedResponse<T>に変換
 */

import { PaginatedResponse } from '../types/common';

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
 * PaginatedResponse型を再エクスポート（後方互換性のため）
 * 新しいコードでは types/common.ts から直接インポートすることを推奨
 */
export type { PaginatedResponse } from '../types/common';

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
