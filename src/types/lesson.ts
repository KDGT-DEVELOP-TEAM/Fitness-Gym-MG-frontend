import { PostureImage } from './posture';

/**
 * バックエンドのTrainingResponseに対応する型
 */
export interface TrainingResponse {
  orderNo: number; // 順序番号（1以上）
  name: string; // トレーニング種目名
  reps: number; // 実施回数
}

/**
 * レッスン本体（取得用）
 * バックエンドのLessonResponseに対応
 */
export interface Lesson {
  id: string;
  customerId: string;
  customerName: string;
  customerDeleted?: boolean; // 顧客が論理削除されているかどうか
  trainerName: string;
  storeName: string;

  startDate: string; // ISO8601
  endDate: string;   // ISO8601

  condition: string | null;
  weight: number | null;
  bmi: number | null; // Java側計算済み
  meal: string | null;
  memo: string | null;

  nextDate: string | null;
  nextStoreName: string | null;
  nextTrainerName: string | null;

  trainings?: TrainingResponse[]; // トレーニングリスト
  postureImages?: PostureImage[]; // 姿勢画像リスト
}

/**
 * レッスン履歴一覧用（軽量）
 */
export type LessonHistoryItem = Pick<
  Lesson,
  'id' | 'customerId' | 'customerName' | 'customerDeleted' | 'trainerName' | 'storeName' | 'startDate' | 'endDate'
>;

/**
 * ============================
 * Request / Form
 * ============================
 */

/**
 * レッスン作成・更新共通リクエスト
 * ※ Spring Controller の DTO と対応
 * customerIdはパスパラメータとして送信されるため、リクエストボディには含めない
 */
export interface LessonRequest {
  trainerId: string;
  storeId: string;

  startDate: string;
  endDate: string;

  condition?: string;
  weight?: number | null;
  meal?: string | null;
  memo?: string | null;

  nextDate?: string | null;
  nextStoreId?: string | null;
  nextTrainerId?: string | null;

  trainings?: TrainingRequest[];
}

/**
 * フォーム専用（UI都合）
 * trainerId → userId, nextTrainerId → nextUserId に変換
 * customerIdはフォームで選択するため必要
 */
export interface LessonFormData extends Omit<LessonRequest, 'trainerId' | 'nextTrainerId'> {
  userId: string;
  nextUserId?: string | null;
  customerId: string; // フォームで選択するため必要
  trainings?: TrainingInput[];
}

/**
 * バックエンドのTrainingRequestに対応する型
 * レッスン作成・更新時に使用
 */
export interface TrainingRequest {
  orderNo: number; // 順序番号（1以上、必須）
  name: string; // トレーニング種目名（必須）
  reps: number; // 実施回数（1以上、必須）
}

/**
 * トレーニング入力（フォーム用）
 */
export interface TrainingInput {
  name: string;
  reps: number;
  orderNo: number; // 必須（フォーム送信時に自動設定）
}

/**
 * ============================
 * Chart / Analytics
 * ============================
 */

export interface ChartSeries {
  period: string; // "10/25 - 10/31"
  count: number;
}

export interface LessonChartData {
  series: ChartSeries[];
  maxCount: number;
  type: 'week' | 'month';
}

/**
 * ============================
 * Admin
 * ============================
 */

export interface LessonAdmin extends Lesson {
  createdAt: string;
  updatedAt: string;
}
