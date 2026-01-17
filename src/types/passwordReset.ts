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
  newPassword: string;
  note?: string;
}

export interface PasswordResetRejection {
  requestId: string;
  note?: string;
}
