import React from 'react';
import { LessonHistoryItem } from '../../types/lesson';

interface LessonCardProps {
  lesson: LessonHistoryItem;
}

export const LessonCard: React.FC<LessonCardProps> = ({ lesson }) => {
  // 日付・時刻のパース
  const rawStart = lesson.start_date || (lesson as any).startDate;
  const rawEnd = lesson.end_date || (lesson as any).endDate;

  const dateObj = rawStart ? new Date(rawStart) : new Date();
  const endDateObj = rawEnd ? new Date(rawEnd) : new Date();

  const dateStr = dateObj.toLocaleDateString('ja-JP');
  const startTime = dateObj.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
  const endTime = endDateObj.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });

  return (
    <tr className="hover:bg-green-50/30 transition-colors group">
      {/* 1. レッスン日時 */}
      <td className="px-8 py-6">
        <div className="flex flex-col items-center text-center">
          <span className="text-base font-bold text-gray-900 group-hover:text-green-600 transition-colors">
            {dateStr}
          </span>
          <span className="text-[11px] font-black text-gray-400 uppercase tracking-wider mt-0.5">
            {startTime} — {endTime}
          </span>
        </div>
      </td>

      {/* 2. 実施店舗 */}
      <td className="px-8 py-6 text-center">
        <span className="inline-flex items-center px-4 py-1 rounded-full text-xs font-black tracking-widest uppercase bg-gray-50 text-gray-500 border border-gray-100 group-hover:bg-white group-hover:border-green-100 transition-all">
          {lesson.stores?.name || '不明な店舗'}
        </span>
      </td>

      {/* 3. 担当トレーナー */}
      <td className="px-8 py-6">
        <div className="flex justify-center items-center">
          <span className="text-sm font-bold text-gray-600">
            {lesson.users?.name || '未設定'}
          </span>
        </div>
      </td>

      {/* 4. 顧客名 */}
      <td className="px-8 py-6">
        <div className="flex flex-col items-center text-center">
          <span className="text-base font-bold text-gray-900 group-hover:text-green-600 transition-colors">
            {lesson.customers?.name || '不明な顧客'}
            <span className="text-[10px] text-gray-400 font-normal ml-1">様</span>
          </span>
          {/* 必要であればここにふりがな等を追加可能 */}
        </div>
      </td>
    </tr>
  );
};