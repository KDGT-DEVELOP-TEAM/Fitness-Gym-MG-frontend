import axios from 'axios';

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

    // HTTPステータスコードに基づくエラーメッセージ
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
