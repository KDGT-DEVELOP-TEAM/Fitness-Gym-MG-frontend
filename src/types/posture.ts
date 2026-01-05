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
  position: 'front' | 'right' | 'back' | 'left'; // バックエンド: position (String)
  takenAt: string; // バックエンド: takenAt (OffsetDateTime)
  consentPublication: boolean; // バックエンド: consentPublication
  // フロントエンド用の追加フィールド
  postureGroupId?: string; // バックエンド: postureGroupId (PostureImageUploadResponseに含まれる)
  url?: string; // 生成された署名付きURL（フロントエンドで追加）
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
