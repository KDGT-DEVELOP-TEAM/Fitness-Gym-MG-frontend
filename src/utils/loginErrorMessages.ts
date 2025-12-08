import { AxiosError } from 'axios';

export const getErrorMessage = (error: unknown): string => {
  // error が null/undefined やオブジェクトでない場合は早期リターン
  if (!error || typeof error !== 'object') {
    return '予期しないエラーが発生しました';
  }

  if (error instanceof Error) {
    // ネットワークエラー
    if (error.message === 'Network Error' || !navigator.onLine) {
      return '通信エラーが発生しました';
    }

    // Axiosエラー
    if ('isAxiosError' in error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const status = axiosError.response?.status;
      const message = axiosError.response?.data?.message;

      switch (status) {
        case 400:
          return message || '入力形式が無効です';
        case 401:
          return 'メールアドレスまたはパスワードが正しくありません';
        case 403:
          return 'アクセス権限がありません';
        case 404:
          return '登録されていないメールアドレスです';
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
};
