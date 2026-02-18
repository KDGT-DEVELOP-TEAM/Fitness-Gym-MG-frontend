/**
 * バックエンドのErrorResponseに対応する型
 * エラーレスポンスの構造を定義
 */
export interface ErrorResponse {
  /**
   * エラーコード
   * 例: "VALIDATION_ERROR", "NOT_FOUND", "CONFLICT"等
   */
  code: string;
  
  /**
   * エラーメッセージ
   * ユーザー向けのエラーメッセージ
   */
  message: string;
  
  /**
   * 複数のエラーメッセージ（オプショナル）
   * バリデーションエラー時に複数のフィールドエラーを返す場合に使用
   */
  errors?: string[];
  
  /**
   * タイムスタンプ（オプショナル）
   * エラー発生時刻（OffsetDateTime形式）
   */
  timestamp?: string;
}

/**
 * エラーコード定数
 * バックエンドのGlobalExceptionHandlerで使用されるエラーコード
 */
export enum ErrorCode {
  // 400 Bad Request
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_REQUEST = 'INVALID_REQUEST',
  BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION',
  BUSINESS_LOGIC_ERROR = 'BUSINESS_LOGIC_ERROR',
  DATA_INTEGRITY_ERROR = 'DATA_INTEGRITY_ERROR',
  FILE_SIZE_EXCEEDED = 'FILE_SIZE_EXCEEDED',
  
  // 401 Unauthorized
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  
  // 403 Forbidden
  ACCESS_DENIED = 'ACCESS_DENIED',
  CUSTOMER_DELETED = 'CUSTOMER_DELETED',
  
  // 404 Not Found
  NOT_FOUND = 'NOT_FOUND',
  
  // 409 Conflict
  CONFLICT = 'CONFLICT',
  
  // 500 Internal Server Error
  STORAGE_ERROR = 'STORAGE_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

/**
 * AxiosエラーのレスポンスデータがErrorResponseかどうかを判定する型ガード
 */
export function isErrorResponse(data: unknown): data is ErrorResponse {
  if (!data || typeof data !== 'object') {
    return false;
  }
  
  const err = data as Record<string, unknown>;
  return (
    typeof err.code === 'string' &&
    typeof err.message === 'string' &&
    (err.errors === undefined || Array.isArray(err.errors)) &&
    (err.timestamp === undefined || typeof err.timestamp === 'string')
  );
}
