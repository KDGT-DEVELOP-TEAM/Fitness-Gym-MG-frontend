import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { LessonHistoryItem } from '../../types/lesson';
import { formatDateTimeSplit } from '../../utils/dateFormatter';

interface DashboardLessonCardProps {
  lesson: LessonHistoryItem;
  from?: 'home' | 'history';
}

export const DashboardLessonCard: React.FC<DashboardLessonCardProps> = ({ lesson, from }) => {
  const navigate = useNavigate();
  
  // 日付・時刻のパース（メモ化）
  const start = useMemo(() => formatDateTimeSplit(lesson.startDate), [lesson.startDate]);
  const end = useMemo(() => formatDateTimeSplit(lesson.endDate), [lesson.endDate]);

  const handleClick = () => {
    if (!lesson.customerId) {
      console.error('[DashboardLessonCard] customerId is missing');
      return;
    }
    
    navigate(`/lesson/${lesson.id}`, {
      state: { from: from || 'history' }
    });
  };

    return (
        <tr 
            className="hover:bg-green-50/30 transition-colors group cursor-pointer"
            onClick={handleClick}
        >
        {/* 1. レッスン日時 */}
        <td className="px-8 py-6">
            <div className="flex flex-col items-center text-center">
            <span className="text-base font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                {start.dateStr}
            </span>
            <span className="text-[11px] font-black text-gray-400 uppercase tracking-wider mt-0.5">
            {start.timeStr} — {end.timeStr}
            </span>
            </div>
        </td>

        {/* 2. 担当トレーナー */}
        <td className="px-8 py-6">
            <div className="flex justify-center items-center">
            <span className="text-sm font-bold text-gray-600">
                {lesson.trainerName || '未設定'}
            </span>
            </div>
        </td>

        {/* 3. 顧客名 */}
        <td className="px-8 py-6">
            <div className="flex flex-col items-center text-center gap-1">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                  {lesson.customerName || '不明な顧客'}
                  <span className="text-[10px] text-gray-400 font-normal ml-1">様</span>
              </span>
              {lesson.customerDeleted && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-200 text-gray-600 whitespace-nowrap">
                  退会済み
                </span>
              )}
            </div>
            {/* 必要であればここにふりがな等を追加可能 */}
            </div>
        </td>

        {/* 4. 実施店舗 */}
        <td className="px-8 py-6 text-center">
            <span className="inline-flex items-center px-4 py-1 rounded-full text-xs font-black tracking-widest uppercase bg-gray-50 text-gray-500 border border-gray-100 group-hover:bg-white group-hover:border-green-100 transition-all">
            {lesson.storeName || '不明な店舗'}
            </span>
        </td>
        </tr>
    );
};
