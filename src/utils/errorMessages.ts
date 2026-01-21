import axios from 'axios';
import { ErrorResponse, ErrorCode, isErrorResponse } from '../types/api/error';

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
export const getErrorMessageByKey = (key: keyof typeof ERROR_MESSAGES): string => {
  return ERROR_MESSAGES[key] || ERROR_MESSAGES.UNKNOWN_ERROR;
};

/**
 * エラーコードに基づいた詳細なエラーメッセージを取得
 * @param errorResponse - ErrorResponseオブジェクト
 * @param context - エラーのコンテキスト（login: ログイン画面用のメッセージ）
 */
const getMessageByErrorCode = (errorResponse: ErrorResponse, context?: 'login'): string | null => {
  switch (errorResponse.code) {
    case ErrorCode.CONFLICT:
      // バックエンドからの具体的なメッセージを優先的に返す
      // 汎用的なメッセージに置き換えない
      return errorResponse.message || 'リソースが既に存在します。';

    case ErrorCode.VALIDATION_ERROR:
      return context === 'login'
        ? (errorResponse.message || '入力形式が無効です')
        : (errorResponse.message || '入力内容を確認してください。');

    case ErrorCode.BUSINESS_RULE_VIOLATION:
      return errorResponse.message || 'ビジネスルールに違反しています。';

    case ErrorCode.BUSINESS_LOGIC_ERROR:
      return errorResponse.message || '処理を実行できませんでした。';

    case ErrorCode.INVALID_REQUEST:
      return context === 'login'
        ? (errorResponse.message || '入力形式が無効です')
        : (errorResponse.message || 'リクエストが無効です。');

    case ErrorCode.DATA_INTEGRITY_ERROR:
      return errorResponse.message || 'データ整合性エラーが発生しました。';

    case ErrorCode.FILE_SIZE_EXCEEDED:
      return 'ファイルサイズが上限を超えています。';

    case ErrorCode.AUTHENTICATION_ERROR:
      return context === 'login'
        ? 'メールアドレスまたはパスワードが正しくありません'
        : '認証に失敗しました。再度ログインしてください。';

    case ErrorCode.ACCESS_DENIED:
      return 'この操作を実行する権限がありません。';

    case ErrorCode.CUSTOMER_DELETED:
      return '顧客は退会済みです';

    case ErrorCode.NOT_FOUND:
      return context === 'login'
        ? '登録されていないメールアドレスです'
        : (errorResponse.message || 'データが見つかりませんでした。');

    case ErrorCode.STORAGE_ERROR:
      return 'ストレージエラーが発生しました。しばらく時間をおいて再度お試しください。';

    case ErrorCode.INTERNAL_ERROR:
      return context === 'login'
        ? 'サーバーで問題が発生しています'
        : 'サーバーエラーが発生しました。しばらく時間をおいて再度お試しください。';

    default:
      return null; // エラーコードが未定義の場合はnullを返し、フォールバック処理に任せる
  }
};

/**
 * 複数のエラーメッセージを取得する
 * @param error - エラーオブジェクト
 * @returns エラーメッセージの配列（エラーがない場合は空配列）
 */
export const getAllErrorMessages = (error: unknown): string[] => {
  if (!error || typeof error !== 'object') {
    return [];
  }

  // Axiosエラー判定
  if (axios.isAxiosError(error) && error.response) {
    const responseData = error.response.data;
    if (isErrorResponse(responseData)) {
      // errors配列がある場合はそれを返す
      if (responseData.errors && responseData.errors.length > 0) {
        return responseData.errors;
      }
      // errors配列がない場合はmessageを返す
      if (responseData.message) {
        return [responseData.message];
      }
    }
  }

  return [];
};

/**
 * エラーオブジェクトから適切なエラーメッセージを取得する
 * @param error - エラーオブジェクト
 * @param context - エラーのコンテキスト（login: ログイン画面用のメッセージ）
 */
export const getErrorMessage = (error: unknown, context?: 'login'): string => {
  // error が null/undefined やオブジェクトでない場合は早期リターン
  if (!error || typeof error !== 'object') {
    return '予期しないエラーが発生しました';
  }

  // Axiosエラー判定（正しい判定方法を使用）
  if (axios.isAxiosError(error)) {
    // ネットワークエラー（navigator.onLineではなく!error.responseで判定）
    if (!error.response) {
      return context === 'login'
        ? '通信エラーが発生しました'
        : 'ネットワークエラーが発生しました。インターネット接続を確認してください。';
    }

    // ErrorResponse形式かどうかを確認
    const responseData = error.response.data;
    if (isErrorResponse(responseData)) {
      // VALIDATION_ERRORかつerrors配列がある場合は全エラーを連結して返す
      if (responseData.code === ErrorCode.VALIDATION_ERROR && 
          responseData.errors && 
          responseData.errors.length > 0) {
        return responseData.errors.join('\n');
      }
      
      // エラーコードに基づいたメッセージを取得
      const codeBasedMessage = getMessageByErrorCode(responseData, context);
      if (codeBasedMessage) {
        return codeBasedMessage;
      }
      // エラーコードが未定義の場合はmessageフィールドを使用
      return responseData.message || 'エラーが発生しました。';
    }

    // ErrorResponse形式でない場合のフォールバック処理（後方互換性）
    const status = error.response.status;
    const message = error.response.data?.message;

    switch (status) {
      case 400:
        return context === 'login'
          ? (message || '入力形式が無効です')
          : (message || 'リクエストが無効です。');

      case 401:
        return context === 'login'
          ? 'メールアドレスまたはパスワードが正しくありません'
          : 'セッションが切れました。再度ログインしてください。';

      case 403:
        // ログインコンテキスト: 無効アカウント or アクセス権限なし
        if (context === 'login') {
          return message === 'Account is disabled' || message?.includes('無効')
            ? 'アカウントが無効です'
            : 'アクセス権限がありません';
        }
        return 'この操作を実行する権限がありません。';

      case 404:
        return context === 'login'
          ? '登録されていないメールアドレスです'
          : 'データが見つかりませんでした。';

      case 500:
        return context === 'login'
          ? 'サーバーで問題が発生しています'
          : 'サーバーエラーが発生しました。しばらく時間をおいて再度お試しください。';

      case 502:
      case 503:
      case 504:
        return context === 'login'
          ? 'サーバーで問題が発生しています'
          : 'サービスが一時的に利用できません。しばらく時間をおいて再度お試しください。';

      default:
        return message || (context === 'login' ? '予期しないエラーが発生しました' : 'エラーが発生しました。');
    }
  }

  // その他のエラー
  if (error instanceof Error) {
    return error.message || '予期しないエラーが発生しました';
  }

  return '予期しないエラーが発生しました';
};
