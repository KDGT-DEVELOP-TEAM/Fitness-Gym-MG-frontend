import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LessonHistoryItem } from '../../types/lesson';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../constants/routes';

interface LessonCardProps {
  lesson: LessonHistoryItem;
  from?: 'home' | 'history';
}
  
const formatDateTime = (dateString: string | undefined | null) => {
  if (!dateString) return { dateStr: '-', timeStr: '--:--' };

  const dateObj = new Date(dateString);
  // 不正な日付文字列の場合は fallback
  if (isNaN(dateObj.getTime())) return { dateStr: '不正な日付', timeStr: '--:--' };

  return {
    dateStr: dateObj.toLocaleDateString('ja-JP'),
    timeStr: dateObj.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
  };
}

export const LessonCard: React.FC<LessonCardProps> = ({ lesson, from }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // 日付・時刻のパース
  const start = formatDateTime(lesson.startDate);
  const end = formatDateTime(lesson.endDate);

  const handleClick = () => {
    if (!lesson.customerId) {
      console.error('[LessonCard] customerId is missing');
      return;
    }
    
    const role = user?.role?.toUpperCase() || 'TRAINER';
    
    // ロールと遷移元に応じたレッスン詳細のパスを生成
    // Homeから遷移する場合は/home/lesson/...、履歴一覧からは/history/lesson/...
    let lessonDetailPath: string;
    const isFromHome = from === 'home';
    
    switch (role) {
      case 'ADMIN':
        lessonDetailPath = isFromHome
          ? ROUTES.LESSON_DETAIL_FROM_HOME_ADMIN.replace(':customerId', lesson.customerId).replace(':lessonId', lesson.id)
          : ROUTES.LESSON_DETAIL_FROM_HISTORY_ADMIN.replace(':customerId', lesson.customerId).replace(':lessonId', lesson.id);
        break;
      case 'MANAGER':
        lessonDetailPath = isFromHome
          ? ROUTES.LESSON_DETAIL_FROM_HOME_MANAGER.replace(':customerId', lesson.customerId).replace(':lessonId', lesson.id)
          : ROUTES.LESSON_DETAIL_FROM_HISTORY_MANAGER.replace(':customerId', lesson.customerId).replace(':lessonId', lesson.id);
        break;
      case 'TRAINER':
      default:
        lessonDetailPath = isFromHome
          ? ROUTES.LESSON_DETAIL_FROM_HOME_TRAINER.replace(':customerId', lesson.customerId).replace(':lessonId', lesson.id)
          : ROUTES.LESSON_DETAIL_FROM_HISTORY_TRAINER.replace(':customerId', lesson.customerId).replace(':lessonId', lesson.id);
        break;
    }
    
    // パスで遷移元を管理するため、stateは不要
    navigate(lessonDetailPath);
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

        {/* 2. 実施店舗 */}
        <td className="px-8 py-6 text-center">
            <span className="inline-flex items-center px-4 py-1 rounded-full text-xs font-black tracking-widest uppercase bg-gray-50 text-gray-500 border border-gray-100 group-hover:bg-white group-hover:border-green-100 transition-all">
            {lesson.storeName || '不明な店舗'}
            </span>
        </td>

        {/* 3. 担当トレーナー */}
        <td className="px-8 py-6">
            <div className="flex justify-center items-center">
            <span className="text-sm font-bold text-gray-600">
                {lesson.trainerName || '未設定'}
            </span>
            </div>
        </td>

        {/* 4. 顧客名 */}
        <td className="px-8 py-6">
            <div className="flex flex-col items-center text-center">
            <span className="text-base font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                {lesson.customerName || '不明な顧客'}
                <span className="text-[10px] text-gray-400 font-normal ml-1">様</span>
            </span>
            {/* 必要であればここにふりがな等を追加可能 */}
            </div>
        </td>
        </tr>
    );
};