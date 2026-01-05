import React from 'react';
import { Lesson } from '../../types/lesson';

interface TrainerLessonCardProps {
  lesson: Lesson;
  onClick?: () => void;
}

const formatDateTime = (dateString: string | undefined | null) => {
  if (!dateString) return { dateStr: '-', timeStr: '--:--' };

  const dateObj = new Date(dateString);
  // 不正な日付文字列の場合は fallback
  if (isNaN(dateObj.getTime())) return { dateStr: '不正な日付', timeStr: '--:--' };

  return {
    dateStr: dateObj.toLocaleDateString('ja-JP', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      weekday: 'short'
    }),
    timeStr: dateObj.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
  };
};

export const TrainerLessonCard: React.FC<TrainerLessonCardProps> = ({ lesson, onClick }) => {
  const start = formatDateTime(lesson.startDate);
  const end = formatDateTime(lesson.endDate);

  return (
    <div
      onClick={onClick}
      className="w-full bg-white border-2 border-gray-100 rounded-2xl p-6 hover:border-green-500 hover:shadow-lg transition-all cursor-pointer group"
    >
      <div className="flex items-center justify-between gap-6">
        {/* 左側: 日時情報 */}
        <div className="flex items-center gap-6 flex-1">
          <div className="flex flex-col items-start min-w-[200px]">
            <span className="text-sm font-black text-gray-400 uppercase tracking-wider mb-1">
              {start.dateStr}
            </span>
            <span className="text-lg font-bold text-gray-900 group-hover:text-green-600 transition-colors">
              {start.timeStr} — {end.timeStr}
            </span>
          </div>

          {/* 中央: 顧客情報 */}
          <div className="flex flex-col items-start flex-1">
            <span className="text-base font-bold text-gray-900 group-hover:text-green-600 transition-colors">
              {lesson.customerName || '不明な顧客'}
              <span className="text-sm text-gray-400 font-normal ml-1">様</span>
            </span>
          </div>

          {/* 右側: 店舗情報 */}
          <div className="flex items-center">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-xs font-black tracking-widest uppercase bg-gray-50 text-gray-500 border border-gray-100 group-hover:bg-green-50 group-hover:border-green-200 group-hover:text-green-600 transition-all">
              {lesson.storeName || '不明な店舗'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

