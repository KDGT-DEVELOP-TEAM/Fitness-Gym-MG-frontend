// PosturePosition型をインポート（ファイルの先頭でインポート）
import type { PosturePosition } from '../constants/posture';
import { PostureImage } from './posture';

/**
 * バックエンドのLessonResponseに対応する型
 */
export interface Lesson {
  id: string;
  startDate: string; // LocalDateTime
  endDate: string; // LocalDateTime
  storeName: string; // 店舗名
  trainerName: string; // トレーナー名
  customerId: string;
  customerName: string; // 顧客名
  condition?: string | null;
  weight?: number | null; // BigDecimal
  bmi?: number | null; // BigDecimal (計算値)
  meal?: string | null;
  memo?: string | null;
  nextDate?: string | null; // LocalDateTime
  nextStoreName?: string | null; // 次回店舗名
  nextTrainerName?: string | null; // 次回トレーナー名
  trainings?: TrainingResponse[]; // トレーニングリスト
  postureImages?: PostureImage[]; // 姿勢画像リスト
}

/**
 * バックエンドのTrainingResponseに対応する型
 */
export interface TrainingResponse {
  orderNo: number; // 順序番号（1以上）
  name: string; // トレーニング種目名
  reps: number; // 実施回数
}

/**
 * フロントエンド用のトレーニング入力型
 */
export interface TrainingInput {
  name: string;
  reps: number;
  orderNo?: number; // オプション（デフォルト値はインデックス+1）
}

/**
 * フロントエンド用のレッスンフォームデータ型
 */
export interface LessonFormData {
  storeId: string;
  userId: string; // trainerIdとして使用
  customerId: string;
  condition?: string | null;
  weight?: number | null;
  meal?: string | null;
  memo?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  nextDate?: string | null;
  nextStoreId?: string | null;
  nextUserId?: string | null; // nextTrainerIdとして使用
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

