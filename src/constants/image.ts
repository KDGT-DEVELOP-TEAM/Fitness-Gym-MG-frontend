/**
 * Image-related constants
 * Centralized definitions for image processing and file uploads
 */

/**
 * Image quality for JPEG compression (0.0 to 1.0)
 */
export const IMAGE_QUALITY = {
  JPEG: 0.92,
} as const;

/**
 * Default canvas dimensions
 */
export const CANVAS_DIMENSIONS = {
  WIDTH: 640,
  HEIGHT: 480,
} as const;

/**
 * Image MIME types
 */
export const IMAGE_CONSTANTS = {
  JPEG_MIME_TYPE: 'image/jpeg',
} as const;

/**
 * ファイルアップロード関連の定数
 * バックエンドのApplicationConstantsと完全に一致させること
 * 
 * ⚠️ 重要: 以下の定数はバックエンドのApplicationConstantsと完全に一致させること
 * 値が変更された場合、フロントエンドで許可されたファイルがバックエンドで拒否される
 * 可能性があります。
 * 
 * バックエンド参照: com.example.fitnessgym_mg.config.ApplicationConstants
 */

/**
 * 最大ファイルサイズ（MB）
 * バックエンドのApplicationConstants.MAX_FILE_SIZE_MBと一致させること
 * バックエンド値: 10
 */
export const MAX_FILE_SIZE_MB = 10;

/**
 * 最大ファイルサイズ（バイト）
 * バックエンドのApplicationConstants.MAX_FILE_SIZE_BYTESと一致させること
 * MAX_FILE_SIZE_MB から自動計算される
 * バックエンド値: 10 * 1024 * 1024 (10MB)
 * 
 * この値がバックエンドと不一致の場合、フロントエンドで許可されたファイルが
 * バックエンドで拒否される可能性があります。
 */
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
