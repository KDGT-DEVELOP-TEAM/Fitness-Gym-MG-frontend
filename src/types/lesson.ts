export interface Lesson {
  id: string;
  storeId: string;
  userId: string;
  customerId: string;
  postureGroupId: string | null;
  condition: string | null;
  weight: number | null;
  meal: string | null;
  memo: string | null;
  startDate: string; // ISO 8601形式
  endDate: string;   // ISO 8601形式
  nextDate: string | null;
  nextStoreId: string | null;
  nextUserId: string | null;
  createdAt: string;
  store_id: string;
  user_id: string; 
  customer_id: string; 
  start_date: string;
  end_date: string;
  [key: string]: any;
}

// 統計・履歴表示用の拡張型
export interface LessonHistoryItem extends Lesson {
  stores: { name: string } | null;
  users: { name: string } | null;
  customers: { name: string } | null;
}

// グラフ表示用の型
export interface ChartData {
  label: string;
  count: number;
}

export interface LessonFormData {
  customerId: string;
  trainerId: string;
  date: string;
  startTime: string;
  endTime: string;
  notes?: string;
}

