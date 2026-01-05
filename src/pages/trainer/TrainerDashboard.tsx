import React, { useState, useEffect } from 'react';
import { trainerHomeApi } from '../../api/trainer/homeApi';
import { TrainerHomeResponse } from '../../types/trainer/home';
import { Lesson } from '../../types/lesson';
import { TrainerLessonCard } from '../../components/lesson/TrainerLessonCard';

const ITEMS_PER_PAGE = 10;

export const TrainerDashboard: React.FC = () => {
  const [homeData, setHomeData] = useState<TrainerHomeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    trainerHomeApi.getHome({
      page: currentPage - 1, // フロントエンドは1ベース、バックエンドは0ベース
      size: ITEMS_PER_PAGE,
    })
      .then(data => {
        setHomeData(data);
        setApiError(null);
      })
      .catch(err => {
        console.error("Trainer Home API Fetch Error:", err);
        setApiError("ダッシュボードデータの取得に失敗しました。");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [currentPage]);

  const upcomingLessons: Lesson[] = homeData?.upcomingLessons || [];
  const total = homeData?.totalLessonCount || 0;
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE) || 1;

  if (apiError) {
    return (
      <div className="p-10 text-red-500 text-center font-bold">
        ⚠️ {apiError}
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* ヘッダー */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-3">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">次回レッスン予定</h1>
          <p className="text-sm text-gray-500">
            <span className="font-bold text-green-600">{total}</span> 件の予約済みレッスン
          </p>
        </div>
      </div>

      {/* レッスン一覧カード */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-400">読み込み中...</div>
          </div>
        ) : upcomingLessons.length > 0 ? (
          upcomingLessons.map(lesson => (
            <TrainerLessonCard key={lesson.id} lesson={lesson} />
          ))
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <p className="text-gray-400">予約済みのレッスンが見つかりませんでした。</p>
          </div>
        )}
      </div>

      {/* ページネーション */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-3">
            <button 
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} 
              disabled={currentPage === 1} 
              className="h-10 px-6 bg-white border border-gray-200 rounded-xl text-xs font-black text-gray-600 disabled:opacity-30 hover:bg-gray-50 transition-all shadow-sm active:scale-95"
            >
              PREV
            </button>
            <button 
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} 
              disabled={currentPage === totalPages} 
              className="h-10 px-6 bg-white border border-gray-200 rounded-xl text-xs font-black text-gray-600 disabled:opacity-30 hover:bg-gray-50 transition-all shadow-sm active:scale-95"
            >
              NEXT
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerDashboard;

