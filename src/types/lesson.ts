import { Customer } from './api/customer';
import { User } from './api/user';
import { Store } from './store';

// バックエンド (Java) から返ってくる基本の型
export interface Lesson {
  id: string;
  customer: Customer;   // オブジェクトで返ってくる
  trainer: User;        // オブジェクトで返ってくる
  store: Store;         // オブジェクトで返ってくる
  startDate: string;      // ISO形式
  endDate: string;        // ISO形式
  condition: string | null;
  weight: number | null;
  bmi: number | null;     // Java側で計算済み
  meal: string | null;
  memo: string | null;
  nextDate: string | null;
  nextStore?: Store | null;
  nextTrainer?: User | null;
  postureGroupId?: string | null;
  nextStoreId?: string | null;
}

export interface TrainingInput {
  name: string;
  reps: number;
  orderNo?: number;
}

export interface LessonFormData {
  storeId: string;
  customerId: string;
  trainerId: string;
  startDate: string;
  endDate: string;
  condition: string;
  weight: number | null;
  bmi: string | null;
  meal: string | null;
  memo: string | null;
  nextDate: string | null;
  nextStoreId: string | null;
  nextTrainerId: string | null;
  postureGroupId?: string | null;
  trainings?: TrainingInput[];
}

export type LessonHistoryItem = Pick<
Lesson,
'id' | 'customer' | 'trainer' | 'store' | 'startDate' | 'endDate'>;

// グラフ表示用の型（JavaのLessonChartData / ChartSeriesに合わせる）
export interface ChartSeries {
  period: string; // "10/25 - 10/31" など
  count: number;
}

export interface LessonChartData {
  series: ChartSeries[];
  maxCount: number;
  type: 'week' | 'month';
}

export interface LessonAdmin extends Lesson {
  createdAt: string;
  updatedAt: string;
}

export interface LessonRequest {
  customerId: string;
  trainerId: string;
  storeId: string;
  startDate: string;
  endDate: string;
  condition?: string;
  weight?: number;
  bmi?: number;
  meal?: string;
  memo?: string;
  nextDate?: string;
  nextStoreId?: string;
  nextTrainerId?: string;
}

export interface AppointmentWithDetails {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  customer: {
    id: string;
    name: string;
    phone?: string;
  };
  instructor: {
    id: string;
    name: string;
  };
  shop: {
    id: string;
    name: string;
  };
}
