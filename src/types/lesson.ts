// src/types/lesson.ts

// バックエンド (Java) から返ってくる基本の型
export interface Lesson {
  id: string;
  customerName: string;   // lesson.getCustomer().getName()
  trainerName: string;    // lesson.getTrainer().getName()
  storeName: string;      // lesson.getStore().getName()
  startDate: string;      // ISO形式
  endDate: string;        // ISO形式
  condition: string | null;
  weight: number | null;
  bmi: number | null;     // Java側で計算済み
  meal: string | null;
  memo: string | null;
  nextDate: string | null;
  nextStoreName: string | null;
  nextTrainerName: string | null;
}

// 履歴表示用（基本のLesson型で項目が足りているなら、継承しなくてもOKです）
// 表示項目に絞るなら、以下のように定義します
export interface LessonHistoryItem {
  id: string;
  customerName: string;
  trainerName: string;
  storeName: string;
  startDate: string;
  endDate: string;
}

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