import React, { useState, useRef, useEffect, useLayoutEffect, useMemo } from 'react';
import { useLessonHistory } from '../../hooks/useLessonHistory';
import { useStores } from '../../hooks/useStore';
import { useAuth } from '../../context/AuthContext';
import { LessonCard } from '../../components/lesson/LessonCard2';
import { managerHomeApi } from '../../api/manager/homeApi';
import { LoadingRow, EmptyRow } from '../../components/common/TableStatusRows';
import { ManagerHomeResponse } from '../../types/manager/home';

const ITEMS_PER_PAGE = 10;

export const ManagerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { stores } = useStores();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [homeData, setHomeData] = useState<ManagerHomeResponse | null>(null); // 今後使用予定
  const [apiError, setApiError] = useState<string | null>(null);

  const storeId = useMemo(() => {
    if (!user?.storeIds) return '';
    return Array.isArray(user.storeIds) ? user.storeIds[0] : user.storeIds;
  }, [user?.storeIds]);

  // --- Home API 呼び出し ---
  useEffect(() => {
    if (!storeId) return;

    managerHomeApi.getHome(storeId, {
      chartType: viewMode,
      page: currentPage - 1, // フロントエンドは1ベース、バックエンドは0ベース
      size: ITEMS_PER_PAGE,
    })
      .then(data => setHomeData(data))
      .catch(err => {
        console.error("Manager Home API Fetch Error:", err);
        setApiError("ダッシュボードデータの取得に失敗しました。");
      });
  }, [storeId, viewMode, currentPage]);

  const currentStoreName = useMemo(() => {
    return stores.find(s => s.id === storeId)?.name || '所属店舗';
  }, [stores, storeId]);

  // --- バックエンド連携フック ---
  const { history, chartData, total, loading, error: historyError, refetch } = useLessonHistory(
    storeId, 
    viewMode
  );

  // storeId や viewMode 変更時にページリセット
  useEffect(() => {
    setCurrentPage(1);
  }, [storeId, viewMode]);

  // ページ番号変更時に refetch
  useEffect(() => {
    if (!storeId) return;
    refetch(currentPage - 1);
  }, [currentPage, refetch, storeId]);

  const handleViewModeChange = (mode: 'week' | 'month') => {
    setViewMode(mode);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE) || 1;

  // グラフスクロール安定化
  useLayoutEffect(() => {
    if (scrollContainerRef.current && chartData) {
      const rafId = requestAnimationFrame(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
        }
      });
      return () => cancelAnimationFrame(rafId);
    }
  }, [chartData]);

  // API / history エラーをまとめて表示
  const displayError = apiError || historyError;
  if (displayError) {
    return (
      <div className="p-10 text-red-500 text-center font-bold">
        ⚠️ {displayError}
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* ヘッダー */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-3">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">統計情報</h1>
          <div className="flex flex-wrap items-center gap-3">
            {/* ロールに応じた店舗表示エリア */}
            <div className="flex items-center">
                <div className="h-10 px-6 bg-white border-2 border-gray-50 rounded-2xl text-sm font-black text-gray-600 flex items-center outline-none shadow-sm">
                  <svg className="w-3.5 h-3.5 mr-2 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  {currentStoreName}
                </div>
            </div>
            <p className="text-sm text-gray-500 px-3 py-1">
              <span className="font-bold text-green-600">{total}</span> 件の実施済みレッスン履歴
            </p>
          </div>
        </div>
      </div>

      {/* 2. 統計グラフ */}
      <div className="bg-white p-8 rounded-[2rem] shadow-2xl shadow-gray-200/50 border border-gray-100">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">レッスン回数グラフ</h2>
          <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
            {(['week', 'month'] as const).map((mode) => (
              <button 
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-6 py-2 text-sm font-black uppercase rounded-xl transition-all ${viewMode === mode ? 'bg-white shadow-md text-green-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {mode === 'week' ? '週' : '月'}
              </button>
            ))}
          </div>
        </div>

        <div ref={scrollContainerRef} className="relative h-64 w-full overflow-x-auto scroll-smooth custom-scrollbar">
          <div className="flex items-end space-x-12 px-4 pb-5 min-w-max h-full">
            {chartData?.series.map((d, i) => (
              <div key={i} className="flex flex-col items-center w-12 h-full justify-end group">
                <span className="text-[10px] font-black text-green-500 mb-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0">{d.count}</span>
                <div 
                  className="w-10 bg-green-500/10 group-hover:bg-green-500 rounded-t-lg transition-all duration-300 relative"
                  style={{ height: `${(d.count / (chartData.maxCount || 1)) * 75}%` }}
                >
                  <div className="absolute inset-0 bg-green-500 rounded-t-lg opacity-20 group-hover:opacity-100 transition-opacity" />
                </div>
                <span className="text-[10px] text-gray-400 mt-4 font-black whitespace-nowrap uppercase tracking-tighter">
                    {d.period}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. 履歴詳細テーブル */}
      <div className="bg-white rounded-[2rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full table-fixed divide-y divide-gray-50">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="w-[25%] px-8 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">レッスン日時</th>
                <th className="w-[25%] px-8 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">担当トレーナー名</th>
                <th className="w-[25%] px-8 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">顧客名</th>
                <th className="w-[25%] px-8 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">実施店舗</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white">
            {loading ? (
                <LoadingRow colSpan={4} />
              ) : history.length > 0 ? (
                history.map(lesson => <LessonCard key={lesson.id} lesson={lesson} from="home" />)
              ) : (
                <EmptyRow colSpan={4} message="実施済みのレッスン履歴が見つかりませんでした。" />
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. ページネーション */}
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

export default ManagerDashboard;