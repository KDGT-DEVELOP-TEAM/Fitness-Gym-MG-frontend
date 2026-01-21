/**
 * Posture position type
 * Valid values: 'front', 'right', 'back', 'left'
 */
export type PosturePosition = 'front' | 'right' | 'back' | 'left';

/**
 * 姿勢画像プレビュー（フロントエンド専用）
 */
export interface PosturePreview {
  position: PosturePosition;
  url: string;
  storageKey: string;
}

export interface Posture {
  id: string;
  customerId: string;
  lessonId?: string;
  imageUrl: string;
  analysis?: PostureAnalysis;
  createdAt: string;
  updatedAt: string;
}

export interface PostureAnalysis {
  angles?: Record<string, number>;
  alignment?: Record<string, number>;
  recommendations?: string[];
}

export interface PostureComparison {
  before: Posture;
  after: Posture;
  improvements?: string[];
}

/**
 * バックエンドのPostureImageResponseに対応する型
 * フィールド名はバックエンド仕様（camelCase）に合わせる
 * feature/new-lesson-detailブランチの構造を維持
 */
export interface PostureImage {
  id: string;
  storageKey: string; // バックエンド: storageKey (camelCase)
  position: PosturePosition; // バックエンド: position (String)
  takenAt: string; // バックエンド: takenAt (OffsetDateTime)
  consentPublication: boolean; // バックエンド: consentPublication
  signedUrl?: string; // バックエンド: signedUrl (レッスン詳細取得時に生成される)
  // フロントエンド用の追加フィールド
  postureGroupId?: string; // バックエンド: postureGroupId (PostureImageUploadResponseに含まれる)
  /**
   * レガシーコードとの互換性のため残存
   * PostureImageGrid.tsx等で使用中。将来的なリファクタリング時にsignedUrlに統一予定
   * 新規コードではsignedUrlを使用すること
   */
  url?: string;
  date?: string; // フォーマットされた日付（フロントエンドで追加）
  formattedDateTime?: string; // 比較モーダル用の日時表示（フロントエンドで追加）
}

/**
 * バックエンドのPostureGroupResponseに対応する型
 */
export interface PostureGroupResponse {
  id: string;
  lessonId: string;
  lessonStartDate: string; // OffsetDateTime
  capturedAt: string; // OffsetDateTime
  images: PostureImage[]; // PostureImageResponse[]
}

/**
 * バックエンドのPostureImageUploadResponseに対応する型
 */
export interface PostureImageUploadResponse {
  id: string;
  postureGroupId: string;
  storageKey: string;
  position: string; // "front", "right", "back", "left"
  takenAt: string; // OffsetDateTime
  createdAt: string; // OffsetDateTime
  signedUrl: string;
  consentPublication: boolean;
}

/**
 * バックエンドのSignedUrlResponseに対応する型
 */
export interface SignedUrlResponse {
  signedUrl: string;
  expiresAt: string; // OffsetDateTime
}

/**
 * バックエンドのBatchSignedUrlResponseに対応する型
 */
export interface BatchSignedUrlResponse {
  urls: Array<{
    imageId: string;
    signedUrl: string;
    expiresAt: string; // OffsetDateTime
  }>;
}

// developブランチから追加された型定義（互換性のため）
export interface PostureGroup {
  id: string;
  lessonId: string;
  customerId: string;
}

export interface SignedUrl {
  imageId: string;
  signedUrl: string;
  expiresAt: string;
}
