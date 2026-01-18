/**
 * Validation utilities
 * Provides common validation functions for form inputs
 */

/**
 * Validate email format
 * 
 * @param email - Email address to validate
 * @returns True if email format is valid
 */
export const validateEmail = (email: string): boolean => {
  if (!email || email.trim() === '') {
    return false;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Validate phone number format
 * Accepts digits and hyphens, minimum 10 digits
 * 
 * @param phone - Phone number to validate
 * @returns True if phone format is valid
 */
export const validatePhone = (phone: string): boolean => {
  if (!phone || phone.trim() === '') {
    return false;
  }
  const phoneRegex = /^[0-9-]+$/;
  const digitsOnly = phone.replace(/-/g, '');
  return phoneRegex.test(phone) && digitsOnly.length >= 10 && digitsOnly.length <= 15;
};

/**
 * Validate phone number format without hyphens
 * Only accepts digits, no hyphens allowed
 * 
 * @param phone - Phone number to validate
 * @returns True if phone format is valid (digits only, 10-15 characters)
 */
export const validatePhoneWithoutHyphens = (phone: string): boolean => {
  if (!phone || phone.trim() === '') {
    return false;
  }
  // ハイフンが含まれている場合は無効
  if (phone.includes('-')) {
    return false;
  }
  // 数字のみで10-15文字
  const phoneRegex = /^[0-9]{10,15}$/;
  return phoneRegex.test(phone.trim());
};

/**
 * Validate required field
 * 
 * @param value - Value to validate
 * @returns True if value is not empty after trimming
 */
export const validateRequired = (value: string): boolean => {
  return value !== null && value !== undefined && value.trim().length > 0;
};

/**
 * Validate password strength
 * Minimum 8 characters
 * 
 * @param password - Password to validate
 * @returns True if password meets minimum requirements
 */
export const validatePassword = (password: string): boolean => {
  return password.length >= 8;
};

/**
 * Validate password pattern
 * 8-16 characters, or empty (for update)
 * 
 * @param password - Password to validate
 * @returns True if password meets requirements
 */
export const validatePasswordPattern = (password: string): boolean => {
  if (!password || password.trim() === '') {
    return true; // Empty is allowed for update
  }
  return password.length >= 8 && password.length <= 16;
};

/**
 * Validate numeric value range
 * 
 * @param value - Numeric value to validate
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @returns True if value is within range
 */
export const validateNumericRange = (value: number | null | undefined, min: number, max: number): boolean => {
  if (value === null || value === undefined) {
    return true; // Optional field
  }
  return value >= min && value <= max;
};

/**
 * Validate date string format (ISO 8601)
 * 
 * @param dateString - Date string to validate
 * @returns True if date string is valid
 */
export const validateDateString = (dateString: string): boolean => {
  if (!dateString || dateString.trim() === '') {
    return true; // Optional field
  }
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

/**
 * Validate date range
 * Ensures endDate is after startDate
 * 
 * @param startDate - Start date string
 * @param endDate - End date string
 * @returns True if date range is valid
 */
export const validateDateRange = (startDate: string, endDate: string): boolean => {
  if (!startDate || !endDate) {
    return true; // Optional fields
  }
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return false;
  }
  return end >= start;
};

/**
 * Validate UUID format
 * 
 * @param uuid - UUID string to validate
 * @returns True if UUID format is valid
 */
export const validateUUID = (uuid: string): boolean => {
  if (!uuid || uuid.trim() === '') {
    return false;
  }
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid.trim());
};

/**
 * Validate that date is in the past
 * 
 * @param dateString - Date string to validate
 * @returns True if date is in the past
 */
export const validatePastDate = (dateString: string): boolean => {
  if (!dateString || dateString.trim() === '') {
    return true; // Optional field
  }
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return false;
  }
  return date < new Date();
};

/**
 * Validate that date/time is not in the future
 * Ensures the date/time is in the past or present
 * 
 * @param dateTimeString - Date-time string to validate (ISO 8601 format)
 * @returns True if date-time is not in the future
 */
export const validateNotFutureDateTime = (dateTimeString: string): boolean => {
  if (!dateTimeString || dateTimeString.trim() === '') {
    return true; // Optional field
  }
  const dateTime = new Date(dateTimeString);
  if (isNaN(dateTime.getTime())) {
    return false;
  }
  const now = new Date();
  return dateTime <= now;
};

/**
 * Validate next lesson fields correlation
 * If any next lesson field is set, all must be set
 * 
 * @param nextDate - Next lesson date
 * @param nextStoreId - Next lesson store ID
 * @param nextTrainerId - Next lesson trainer ID
 * @returns True if validation passes
 */
export const validateNextLesson = (
  nextDate: string | null | undefined,
  nextStoreId: string | null | undefined,
  nextTrainerId: string | null | undefined
): boolean => {
  const anySet = nextDate || nextStoreId || nextTrainerId;
  const allSet = nextDate && nextStoreId && nextTrainerId;
  return !anySet || !!allSet;
};

/**
 * Get current date-time in local timezone formatted for datetime-local input
 * Returns format: YYYY-MM-DDTHH:mm
 * 
 * @returns Current date-time string in datetime-local format
 */
export const getCurrentLocalDateTime = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

