import axios from 'axios';
import { ErrorResponse, ErrorCode, isErrorResponse } from '../types/api/error';

/**
 * エラーコードに基づいた詳細なエラーメッセージを取得
 * @param errorResponse - ErrorResponseオブジェクト
 * @param context - エラーのコンテキスト（login: ログイン画面用のメッセージ）
 */
const getMessageByErrorCode = (errorResponse: ErrorResponse, context?: 'login'): string | null => {
  switch (errorResponse.code) {
    case ErrorCode.CONFLICT:
      // 重複エラー時の詳細メッセージ
      if (errorResponse.message.includes('email') || errorResponse.message.includes('メール')) {
        return 'このメールアドレスは既に登録されています。';
      }
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
