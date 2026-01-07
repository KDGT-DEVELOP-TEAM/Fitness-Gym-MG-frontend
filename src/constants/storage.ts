/**
 * Storage-related constants
 * Centralized definitions for storage bucket names and MIME types
 */

export const STORAGE_CONSTANTS = {
  POSTURES_BUCKET: 'postures',
} as const;

export const IMAGE_CONSTANTS = {
  JPEG_MIME_TYPE: 'image/jpeg',
} as const;

/**
 * Maximum file size for uploads (10MB)
 * Matches backend ApplicationConstants.MAX_FILE_SIZE_BYTES
 */
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
