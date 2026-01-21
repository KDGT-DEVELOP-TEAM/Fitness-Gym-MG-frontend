/**
 * Storage-related constants
 * Centralized definitions for storage bucket names
 * 
 * ⚠️ 重要: ストレージバケット名はバックエンドのSupabaseStorageProperties.bucketと一致させること
 * 値が変更された場合、フロントエンドとバックエンドで不整合が発生し、
 * ファイルのアップロード・取得に失敗する可能性があります。
 * 
 * バックエンド参照: com.example.fitnessgym_mg.config.SupabaseStorageProperties
 */

/**
 * ストレージバケット名
 * 環境変数VITE_STORAGE_BUCKET_NAMEから取得、未設定の場合はデフォルト値'postures'を使用
 * バックエンドのSupabaseStorageProperties.bucketと一致させること
 * バックエンドデフォルト値: 'postures'
 */
export const STORAGE_CONSTANTS = {
  POSTURES_BUCKET: import.meta.env.VITE_STORAGE_BUCKET_NAME || 'postures',
} as const;
