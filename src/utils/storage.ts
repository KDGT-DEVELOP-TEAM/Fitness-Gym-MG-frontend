const USER_KEY = 'user';
const TOKEN_KEY = 'token';

export const storage = {
  // ユーザー情報の保存
  setUser: (user: { userId: string; email: string; name: string; role: string }): void => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  // ユーザー情報の取得
  getUser: (): { userId: string; email: string; name: string; role: string } | null => {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch (error) {
      // 不正なデータの場合は削除してnullを返す
      console.error('[storage] Failed to parse user data:', error);
      localStorage.removeItem(USER_KEY);
      return null;
    }
  },

  /**
   * JWTトークンの保存
   * ⚠️ セキュリティ注意: localStorageはXSS攻撃の影響を受けます。
   * 本番環境では、可能な限りHttpOnly Cookieの使用を検討してください。
   * 現在の実装では、XSS対策（入力値のサニタイズ、CSP設定など）を徹底してください。
   */
  setToken: (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
  },

  // JWTトークンの取得
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  // JWTトークンの削除
  removeToken: (): void => {
    localStorage.removeItem(TOKEN_KEY);
  },

  // ユーザー情報の削除
  removeUser: (): void => {
    localStorage.removeItem(USER_KEY);
  },

  // 全認証データのクリア
  clear: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};
