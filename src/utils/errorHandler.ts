/**
 * Common error handler utilities
 * Provides unified error handling and logging
 */

import { logger } from './logger';
import { AxiosError } from 'axios';

export enum ErrorType {
  API_ERROR = 'API_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface AppError {
  type: ErrorType;
  message: string;
  originalError?: unknown;
  statusCode?: number;
  details?: Record<string, unknown>;
}

/**
 * Create a standardized error object
 */
export function createError(
  type: ErrorType,
  message: string,
  originalError?: unknown,
  details?: Record<string, unknown>
): AppError {
  const error: AppError = {
    type,
    message,
    originalError,
    details,
  };

  // Extract status code if available
  if (originalError && typeof originalError === 'object') {
    const err = originalError as { status?: number; statusCode?: number; response?: { status?: number } };
    error.statusCode = err.status ?? err.statusCode ?? err.response?.status;
  }

  return error;
}

/**
 * Handle API errors
 */
export function handleApiError(error: unknown): AppError {
  if (error && typeof error === 'object') {
    const err = error as { message?: string; status?: number; statusCode?: number; response?: { status?: number; data?: unknown } };

    // Axios error
    if ('response' in err) {
      const status = err.response?.status ?? err.status ?? err.statusCode;
      const message = err.response?.data && typeof err.response.data === 'object' && 'message' in err.response.data
        ? String((err.response.data as { message: unknown }).message)
        : err.message ?? 'API request failed';

      return createError(
        status === 401 ? ErrorType.AUTH_ERROR : ErrorType.API_ERROR,
        message,
        error,
        { statusCode: status }
      );
    }

    // Error with message
    if ('message' in err && typeof err.message === 'string') {
      return createError(ErrorType.API_ERROR, err.message, error);
    }
  }

  // Unknown error
  return createError(
    ErrorType.UNKNOWN_ERROR,
    error instanceof Error ? error.message : 'An unknown error occurred',
    error
  );
}

/**
 * Handle network errors
 */
export function handleNetworkError(error: unknown): AppError {
  if (error instanceof Error) {
    // Check for network-related error messages
    if (error.message.includes('Network') || error.message.includes('network') || error.message.includes('fetch')) {
      return createError(
        ErrorType.NETWORK_ERROR,
        'Network request failed. Please check your internet connection.',
        error
      );
    }
  }

  return createError(
    ErrorType.NETWORK_ERROR,
    error instanceof Error ? error.message : 'Network error occurred',
    error
  );
}

/**
 * Get user-friendly error message
 * 本番環境では詳細なエラーメッセージを隠し、セキュリティを向上
 */
export function getUserFriendlyMessage(error: AppError): string {
  const isProduction = process.env.NODE_ENV === 'production';

  switch (error.type) {
    case ErrorType.AUTH_ERROR:
      return '認証に失敗しました。ログイン情報を確認してください。';
    case ErrorType.NETWORK_ERROR:
      return 'ネットワークエラーが発生しました。接続を確認してください。';
    case ErrorType.VALIDATION_ERROR:
      // バリデーションエラーはユーザーに表示する必要があるため、そのまま返す
      return error.message;
    case ErrorType.API_ERROR:
      if (error.statusCode === 404) {
        return 'リソースが見つかりませんでした。';
      }
      if (error.statusCode === 500) {
        return 'サーバーエラーが発生しました。しばらくしてから再度お試しください。';
      }
      // 本番環境では詳細なエラーメッセージを隠す
      if (isProduction) {
        return 'リクエストに失敗しました。しばらくしてから再度お試しください。';
      }
      return error.message || 'リクエストに失敗しました。';
    default:
      // 本番環境では詳細なエラーメッセージを隠す
      if (isProduction) {
        return 'エラーが発生しました。しばらくしてから再度お試しください。';
      }
      return error.message || 'エラーが発生しました。';
  }
}

/**
 * Log error using logger system
 */
export function logError(error: AppError, context?: string): void {
  logger.error(
    `${error.type}: ${error.message}`,
    {
      statusCode: error.statusCode,
      details: error.details,
      originalError: error.originalError,
    },
    context
  );
}

/**
 * Get user-friendly error message for login errors
 * Uses unified error messages to prevent user enumeration attacks
 */
export function getLoginErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'status' in error && 'message' in error) {
    const err = error as { status?: number; message?: string };
    const status = typeof err.status === 'number' ? err.status : undefined;
    const message = typeof err.message === 'string' ? err.message : undefined;

    // Use unified message for authentication failures to prevent user enumeration
    if (status === 400 || status === 401) {
      return 'メールアドレスまたはパスワードが正しくありません';
    }
    if (message) {
      return message;
    }
    return 'サインインに失敗しました';
  }

  // Handle Error objects
  if (error instanceof Error) {
    // Network errors
    if (error.message === 'Network Error' || !navigator.onLine) {
      return '通信エラーが発生しました';
    }

    // Axios errors
    if ('isAxiosError' in error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const status = axiosError.response?.status;
      const message = axiosError.response?.data?.message;

      switch (status) {
        case 400:
          return message || '入力形式が無効です';
        case 401:
        case 404:
          // Security: Use unified error message to prevent user enumeration attacks
          return 'メールアドレスまたはパスワードが正しくありません';
        case 403:
          return 'アクセス権限がありません';
        case 500:
        case 502:
        case 503:
        case 504:
          return 'サーバーで問題が発生しています';
        default:
          return message || '予期しないエラーが発生しました';
      }
    }

    return error.message || '予期しないエラーが発生しました';
  }

  return '予期しないエラーが発生しました';
}
