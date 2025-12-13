import axios from 'axios';

/**
 * エラーオブジェクトから適切なエラーメッセージを取得する
 */
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    // ネットワークエラー
    if (!error.response) {
      return 'ネットワークエラーが発生しました。インターネット接続を確認してください。';
    }

    // HTTPステータスコードに基づくエラーメッセージ
    const status = error.response.status;
    const message = error.response.data?.message;

    switch (status) {
      case 400:
        return message || 'リクエストが無効です。';
      case 401:
        return 'セッションが切れました。再度ログインしてください。';
      case 403:
        return 'この操作を実行する権限がありません。';
      case 404:
        return 'データが見つかりませんでした。';
      case 500:
        return 'サーバーエラーが発生しました。しばらく時間をおいて再度お試しください。';
      case 503:
        return 'サービスが一時的に利用できません。しばらく時間をおいて再度お試しください。';
      default:
        return message || 'エラーが発生しました。';
    }
  }

  // その他のエラー
  if (error instanceof Error) {
    return error.message;
  }

  return '予期しないエラーが発生しました。';
};
