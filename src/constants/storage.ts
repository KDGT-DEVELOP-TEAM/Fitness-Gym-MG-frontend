/**
 * Storage-related constants
 * Centralized definitions for storage bucket names
 */

/**
 * ストレージバケット名
 * 環境変数VITE_STORAGE_BUCKET_NAMEから取得、未設定の場合はデフォルト値'postures'を使用
 * バックエンドのSupabaseStorageProperties.bucketと一致させること
 */
export const STORAGE_CONSTANTS = {
  POSTURES_BUCKET: import.meta.env.VITE_STORAGE_BUCKET_NAME || 'postures',
} as const;
