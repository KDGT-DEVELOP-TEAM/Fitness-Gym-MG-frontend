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
 * Validate password pattern
 * 8-16 characters, or empty (for update)
 * Must contain at least one letter (uppercase or lowercase) and one digit
 * 
 * バックエンドのバリデーション要件（LoginRequest, UserRequest）と整合:
 * - 8文字以上16文字以内
 * - 英字（大文字・小文字）と数字を含む必要があります
 * 
 * @param password - Password to validate
 * @returns True if password meets requirements
 */
export const validatePasswordPattern = (password: string): boolean => {
  if (!password || password.trim() === '') {
    return true; // Empty is allowed for update
  }
  
  // 長さチェック
  if (password.length < 8 || password.length > 16) {
    return false;
  }
  
  // 英字と数字を含む必要がある（バックエンドのLoginRequestとUserRequestと整合）
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasDigit = /\d/.test(password);
  
  return hasLetter && hasDigit;
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

/**
 * Validation result type
 * Used for form validation functions that return both validation status and error message
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Customer form data for validation
 */
export interface CustomerFormValidationData {
  name: string;
  kana: string;
  address: string;
  email: string;
  phone: string;
  birthday?: string;
  height: string | number;
}

/**
 * Validate customer form data
 * 
 * Validates all required fields and business rules for customer form.
 * Returns validation result with error message if validation fails.
 * 
 * Validation rules:
 * - All required fields (name, kana, address, email, phone) must not be empty after trimming
 * - Phone number must not contain hyphens
 * - Phone number must be 10-15 digits only
 * - Birthday must be in the past (if provided)
 * - Height must be between 50 and 300 cm (if provided)
 * 
 * @param formData - Customer form data to validate
 * @returns Validation result object { isValid: boolean, error?: string }
 */
export const validateCustomerForm = (
  formData: CustomerFormValidationData
): ValidationResult => {
  // 必須項目の空白チェック（先頭・末尾の空白をトリムして検証）
  if (!formData.name.trim()) {
    return { isValid: false, error: '氏名は必須です' };
  }
  if (!formData.kana.trim()) {
    return { isValid: false, error: 'フリガナは必須です' };
  }
  if (!formData.address.trim()) {
    return { isValid: false, error: '住所は必須です' };
  }
  if (!formData.email.trim()) {
    return { isValid: false, error: 'メールアドレスは必須です' };
  }
  if (!formData.phone.trim()) {
    return { isValid: false, error: '電話番号は必須です' };
  }

  // 電話番号のバリデーション（ハイフンを含めない）
  if (formData.phone.includes('-')) {
    return { isValid: false, error: '電話番号にハイフン（-）を含めることはできません' };
  }
  if (!validatePhoneWithoutHyphens(formData.phone)) {
    return { isValid: false, error: '電話番号は10文字以上15文字以下の数字のみで入力してください' };
  }

  // 過去日付チェック
  if (formData.birthday && !validatePastDate(formData.birthday)) {
    return { isValid: false, error: '生年月日は過去の日付である必要があります' };
  }

  // 身長の範囲チェック（文字列の場合は数値に変換）
  const heightValue = typeof formData.height === 'string' 
    ? parseFloat(formData.height) 
    : formData.height;
  if (isNaN(heightValue) || heightValue < 50 || heightValue > 300) {
    return { isValid: false, error: '身長は50cm以上300cm以下である必要があります' };
  }

  return { isValid: true };
};

/**
 * User form data for validation
 */
export interface UserFormValidationData {
  pass: string;
  role: string;
  storeId?: string;
}

/**
 * Validate user form data
 * 
 * Validates business rules for user form.
 * Returns validation result with error message if validation fails.
 * 
 * Validation rules:
 * - Password must meet pattern requirements (8-16 chars, letter + digit) if provided
 *   - For new users: password is required
 *   - For existing users: password is optional (only validated if provided)
 * - Store must be selected for MANAGER and TRAINER roles
 * 
 * @param formData - User form data to validate
 * @param isEditMode - Whether form is in edit mode (default: false)
 * @returns Validation result object { isValid: boolean, error?: string }
 */
export const validateUserForm = (
  formData: UserFormValidationData,
  isEditMode: boolean = false
): ValidationResult => {
  // パスワードバリデーション（新規作成時、または更新時にパスワードが指定されている場合）
  if ((!isEditMode || (formData.pass && formData.pass.trim() !== '')) && 
      formData.pass && 
      !validatePasswordPattern(formData.pass)) {
    return { isValid: false, error: 'パスワードは8文字以上16文字以内で、英字と数字を含めてください' };
  }

  // トレーナーと店長の場合、店舗が選択されていることを確認
  if ((formData.role === 'MANAGER' || formData.role === 'TRAINER') && 
      (!formData.storeId || formData.storeId.trim() === '')) {
    return { isValid: false, error: '担当店舗を選択してください' };
  }

  return { isValid: true };
};

