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

