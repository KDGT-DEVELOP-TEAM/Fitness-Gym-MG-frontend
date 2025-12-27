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

export interface PostureImage {
  id: string;
  storage_key: string;
  position: 'front' | 'right' | 'back' | 'left';
  taken_at: string;
  posture_group_id: string;
  url?: string; // 生成された署名付きURL
  date?: string; // フォーマットされた日付
  formattedDateTime?: string; // 比較モーダル用の日時表示
}

