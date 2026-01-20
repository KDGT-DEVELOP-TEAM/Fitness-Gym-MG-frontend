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

  /**
   * 開始日時
   * ISO8601形式の日時文字列
   * バリデーション要件: 必須、現在の日時より未来に設定できない（過去または現在のみ）
   */
  startDate: string;
  /**
   * 終了日時
   * ISO8601形式の日時文字列
   * バリデーション要件: 必須、開始日時より後である必要がある、現在の日時より未来に設定できない（過去または現在のみ）
   */
  endDate: string;

  /**
   * 体調
   * バリデーション要件: 任意、最大500文字
   */
  condition?: string;
  /**
   * 体重（kg）
   * バリデーション要件: 任意、30.0kg以上、300.0kg以下
   */
  weight?: number | null;
  /**
   * 食事内容
   * バリデーション要件: 任意、最大500文字
   */
  meal?: string | null;
  /**
   * メモ
   * バリデーション要件: 任意、最大1000文字
   */
  memo?: string | null;

  nextDate?: string | null;
  nextStoreId?: string | null;
  nextTrainerId?: string | null;

  /**
   * トレーニングリスト
   * バリデーション要件: 任意、最大50件まで（パフォーマンス・DoS対策のため）
   * バックエンドのApplicationConstants.MAX_LESSON_TRAININGS_COUNTに対応
   */
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
  /**
   * 順序番号
   * バリデーション要件: 必須、1以上
   */
  orderNo: number;
  /**
   * トレーニング種目名
   * バリデーション要件: 必須、最大100文字
   */
  name: string;
  /**
   * 実施回数
   * バリデーション要件: 必須、1以上、10000以下
   */
  reps: number;
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
