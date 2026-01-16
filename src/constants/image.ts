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
 * Maximum file size for uploads (10MB)
 * 
 * 重要: バックエンドのApplicationConstants.MAX_FILE_SIZE_BYTESと一致させること
 * バックエンド値: 10 * 1024 * 1024 (10MB)
 * 
 * この値がバックエンドと不一致の場合、フロントエンドで許可されたファイルが
 * バックエンドで拒否される可能性があります。
 */
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
