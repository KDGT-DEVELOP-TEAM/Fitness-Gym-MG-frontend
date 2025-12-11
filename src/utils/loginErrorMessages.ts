import { AxiosError } from 'axios';

export const getErrorMessage = (error: unknown): string => {
  // error が null/undefined やオブジェクトでない場合は早期リターン
  if (!error || typeof error !== 'object') {
    return '予期しないエラーが発生しました';
  }

  // Supabase Auth エラー (status と message を持つ)
  if ('status' in error && typeof (error as any).status === 'number' && 'message' in error) {
    const status = (error as any).status as number;
    const message = (error as any).message as string | undefined;
    switch (status) {
      case 400:
      case 401:
        return message || 'メールアドレスまたはパスワードが正しくありません';
      default:
        return message || 'サインインに失敗しました';
    }
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
