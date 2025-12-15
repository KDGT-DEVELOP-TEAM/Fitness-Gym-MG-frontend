// PosturePosition型をインポート（ファイルの先頭でインポート）
import type { PosturePosition } from '../constants/posture';

export interface Lesson {
  id: string;
  storeId: string;
  userId: string;
  customerId: string;
  postureGroupId?: string | null;
  condition?: string | null;
  weight?: number | null;
  meal?: string | null;
  memo?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  nextDate?: string | null;
  nextStoreId?: string | null;
  nextUserId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface TrainingInput {
  name: string;
  reps: number;
  orderNo?: number;
}

export interface LessonFormData {
  storeId: string;
  userId: string;
  customerId: string;
  postureGroupId?: string | null;
  condition?: string | null;
  weight?: number | null;
  meal?: string | null;
  memo?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  nextDate?: string | null;
  nextStoreId?: string | null;
  nextUserId?: string | null;
  trainings?: TrainingInput[];
}

// PosturePreview型を追加
export interface PosturePreview {
  position: PosturePosition;
  url: string;
  storageKey: string;
}

// PosturePosition型を再エクスポート
export type { PosturePosition } from '../constants/posture';

