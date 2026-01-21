/**
 * JWTトークン関連のユーティリティ関数
 * トークンのデコードと有効期限チェックを行う
 */

interface JWTPayload {
  exp?: number; // 有効期限（Unix timestamp）
  iat?: number; // 発行日時（Unix timestamp）
  [key: string]: unknown;
}

/**
 * JWTトークンをデコードする（署名検証は行わない）
 * @param token JWTトークン文字列
 * @returns デコードされたペイロード、またはnull（デコード失敗時）
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // Base64URLデコード
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded) as JWTPayload;
  } catch (error) {
    return null;
  }
}

/**
 * JWTトークンの有効期限をチェックする
 * @param token JWTトークン文字列
 * @returns 有効な場合はtrue、無効または期限切れの場合はfalse
 */
export function isTokenValid(token: string | null): boolean {
  if (!token) {
    return false;
  }

  const payload = decodeJWT(token);
  if (!payload || !payload.exp) {
    // expクレームがない場合は有効とみなす（バックエンドで検証される）
    return true;
  }

  // expはUnix timestamp（秒単位）
  const expirationTime = payload.exp * 1000; // ミリ秒に変換
  const currentTime = Date.now();

  // 有効期限の5分前をマージンとして設定（ネットワーク遅延などを考慮）
  const margin = 5 * 60 * 1000; // 5分（ミリ秒）

  return currentTime < expirationTime - margin;
}

/**
 * JWTトークンの有効期限までの残り時間を取得する（秒単位）
 * @param token JWTトークン文字列
 * @returns 残り時間（秒）、またはnull（無効なトークンの場合）
 */
export function getTokenExpirationTime(token: string | null): number | null {
  if (!token) {
    return null;
  }

  const payload = decodeJWT(token);
  if (!payload || !payload.exp) {
    return null;
  }

  const expirationTime = payload.exp * 1000; // ミリ秒に変換
  const currentTime = Date.now();
  const remainingTime = Math.floor((expirationTime - currentTime) / 1000); // 秒に変換

  return remainingTime > 0 ? remainingTime : null;
}
