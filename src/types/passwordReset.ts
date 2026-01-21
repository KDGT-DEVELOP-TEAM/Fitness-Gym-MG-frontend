/**
 * パスワードリセットリクエスト関連の型定義
 */

export type PasswordResetStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface PasswordResetRequestCreate {
  email: string;
  name: string;
}

export interface PasswordResetRequestResponse {
  id: string;
  email: string;
  name: string;
  userId?: string;
  userName?: string;
  status: PasswordResetStatus;
  requestedAt: string;
  processedAt?: string;
  processedByUserId?: string;
  processedByUserName?: string;
  note?: string;
}

export interface PasswordResetApproval {
  requestId: string;
  /**
   * 新しいパスワード
   * バリデーション要件:
   * - 必須
   * - 8文字以上
   * - 英字（大文字・小文字）と数字を含む必要があります
   * ⚠️ セキュリティ注意: このフィールドは平文パスワードを含みます。
   * ログ出力やデバッグ情報に含めないでください。
   */
  newPassword: string;
  note?: string;
}

export interface PasswordResetRejection {
  requestId: string;
  note?: string;
}
