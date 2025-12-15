/**
 * Data transformation utilities
 * Common functions for transforming data between application and database formats
 */

/**
 * Convert empty string to null
 * Used for database fields that should be null instead of empty strings
 * 
 * @param value - String value to convert
 * @returns Null if value is empty or whitespace, otherwise the original value
 */
export const toNull = (value: string | null | undefined): string | null => {
  return value && value.trim() !== '' ? value : null;
};
