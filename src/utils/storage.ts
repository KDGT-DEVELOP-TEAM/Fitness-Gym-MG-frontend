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
    return JSON.parse(userStr);
  },

  // JWTトークンの保存
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
