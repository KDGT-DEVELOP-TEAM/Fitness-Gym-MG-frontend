/**
 * Error message constants
 * Centralized error messages for consistent user experience
 * All messages are in Japanese for consistency
 */

export const ERROR_MESSAGES = {
  // Authentication errors
  AUTH_FAILED: '認証に失敗しました。ログイン情報を確認してください。',
  AUTH_REQUIRED: 'ログインが必要です。',
  SESSION_EXPIRED: 'セッションの有効期限が切れました。再度ログインしてください。',
  LOGIN_FAILED: 'メールアドレスまたはパスワードが正しくありません',
  LOGOUT_FAILED: 'ログアウトに失敗しました',

  // Network errors
  NETWORK_ERROR: 'ネットワークエラーが発生しました。接続を確認してください。',
  CONNECTION_TIMEOUT: '接続がタイムアウトしました。しばらくしてから再度お試しください。',

  // API errors
  API_ERROR: 'リクエストに失敗しました。',
  NOT_FOUND: 'リソースが見つかりませんでした。',
  SERVER_ERROR: 'サーバーエラーが発生しました。しばらくしてから再度お試しください。',
  BAD_REQUEST: '入力形式が無効です。',
  FORBIDDEN: 'アクセス権限がありません。',
  UNAUTHORIZED: '認証が必要です。',
  CONFLICT: 'リソースが既に存在します。',

  // Database errors
  DB_ERROR: 'データベース操作に失敗しました。',
  DB_CONNECTION_ERROR: 'データベースへの接続に失敗しました。',

  // Validation errors
  REQUIRED_FIELD: '必須項目です。',
  INVALID_EMAIL: 'メールアドレスの形式が正しくありません。',
  INVALID_PHONE: '電話番号の形式が正しくありません。',
  INVALID_DATE: '日付の形式が正しくありません。',
  DATE_RANGE_ERROR: '終了日時は開始日時より後にしてください。',

  // Form errors
  FORM_SUBMIT_ERROR: '送信に失敗しました。入力内容を確認してください。',
  FORM_VALIDATION_ERROR: '入力内容に誤りがあります。',

  // Lesson errors
  LESSON_CREATE_ERROR: 'レッスン作成に失敗しました。',
  LESSON_UPDATE_ERROR: 'レッスン更新に失敗しました。',
  LESSON_DELETE_ERROR: 'レッスン削除に失敗しました。',
  LESSON_NOT_FOUND: 'レッスンが見つかりませんでした。',
  LESSON_LOAD_ERROR: 'レッスン情報の取得に失敗しました。',

  // Image errors
  IMAGE_UPLOAD_ERROR: '画像のアップロードに失敗しました。',
  IMAGE_DELETE_ERROR: '画像の削除に失敗しました。',
  IMAGE_LOAD_ERROR: '画像の取得に失敗しました。',
  IMAGE_NOT_FOUND: '画像が見つかりませんでした。',

  // Customer errors
  CUSTOMER_NOT_FOUND: '顧客が見つかりませんでした。',
  CUSTOMER_LOAD_ERROR: '顧客情報の取得に失敗しました。',

  // General errors
  UNKNOWN_ERROR: '予期しないエラーが発生しました。',
  OPERATION_FAILED: '操作に失敗しました。',
  RETRY_LATER: 'しばらくしてから再度お試しください。',
} as const;

/**
 * Get error message by key
 * 
 * @param key - Error message key
 * @returns Error message string
 */
export const getErrorMessage = (key: keyof typeof ERROR_MESSAGES): string => {
  return ERROR_MESSAGES[key] || ERROR_MESSAGES.UNKNOWN_ERROR;
};
