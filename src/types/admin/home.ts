import { Lesson, LessonChartData } from '../lesson';

/**
 * バックエンドのHomeResponseに対応する型
 * Admin/Manager用: recentLessons, totalLessonCount, chartData を使用
 * Trainer用: upcomingLessons を使用
 */
export interface HomeResponse {
  /**
   * レッスン履歴一覧（最新の数件）
   * Admin/Manager用: レッスン履歴を表示するために使用
   * Trainer用: null（使用しない）
   */
  recentLessons: Lesson[] | null;
  
  /**
   * レッスン実施回数（統計情報）
   * Admin/Manager: レッスン履歴の総件数を設定
   * Trainer: 0を設定（統計情報は表示しない）
   */
  totalLessonCount: number;
  
  /**
   * グラフデータ（Admin/Manager用）
   * Admin/Manager用: レッスン実施状況のグラフ表示に使用
   * Trainer用: null（使用しない）
   */
  chartData: LessonChartData | null;
  
  /**
   * 直近1週間のレッスン概要（Trainer用）
   * Trainer用: 当日・直近1週間以内の予約状況/レッスン概要を表示するために使用
   * Admin/Manager用: null（使用しない）
   */
  upcomingLessons: Lesson[] | null;
}

/**
 * Admin用のHomeResponseエイリアス
 */
export type AdminHomeResponse = HomeResponse;