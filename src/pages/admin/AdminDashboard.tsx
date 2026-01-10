import React, { useState, useRef, useEffect, useLayoutEffect, useMemo } from 'react';
import { useStores } from '../../hooks/useStore';
import { LessonCard } from '../../components/lesson/LessonCard2';
import { LoadingRow, EmptyRow } from '../../components/common/TableStatusRows';
import { adminHomeApi } from '../../api/admin/homeApi'; 
import { AdminHomeResponse } from '../../types/admin/home'

const ITEMS_PER_PAGE = 10;

export const AdminDashboard: React.FC = () => {
  const { stores } = useStores();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [selectedStoreId, setSelectedStoreId] = useState<'all' | string>('all');
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [currentPage, setCurrentPage] = useState(1);
  const [homeData, setHomeData] = useState<AdminHomeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setApiError(null);
    adminHomeApi.getHome({
      chartType: viewMode,
      page: currentPage - 1, // フロントエンドは1ベース、バックエンドは0ベース
      size: ITEMS_PER_PAGE,
    })
      .then(data => {
        setHomeData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Admin Home API Fetch Error:", err);
        setApiError("ダッシュボードデータの取得に失敗しました。");
        setLoading(false);
      });
  }, [viewMode, currentPage]);

  const handleStoreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStoreId(e.target.value);
    setCurrentPage(1); // 条件変更時は必ず1ページ目へ
  };

  const handleViewModeChange = (mode: 'week' | 'month') => {
    setViewMode(mode);
    setCurrentPage(1); // 条件変更時は必ず1ページ目へ
  };

  // 表示店舗名の取得ロジック
  const currentStoreDisplay = useMemo(() => {
    if (selectedStoreId === 'all') return '全店舗';
    return stores.find(s => s.id === selectedStoreId)?.name || '店舗を選択中...';
  }, [stores, selectedStoreId]);

  // homeDataからデータを取得
  const chartData = homeData?.chartData || null;
  const recentLessons = homeData?.recentLessons || [];
  const totalLessonCount = homeData?.totalLessonCount || 0;

  // 総ページ数の計算
  const totalPages = Math.ceil(totalLessonCount / ITEMS_PER_PAGE) || 1;

  // グラフの最新へのスクロール制御
  useLayoutEffect(() => {
    if (scrollContainerRef.current && chartData) {
      // requestAnimationFrame を組み合わせて描画タイミングを同期
      const scrollToEnd = () => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
        }
      };
      const rafId = requestAnimationFrame(scrollToEnd);
      return () => cancelAnimationFrame(rafId);
    }
  }, [chartData]);

  // エラー表示
  if (apiError) return <div className="p-10 text-red-500 text-center font-bold">⚠️ {apiError}</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* ヘッダー */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-3">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">統計情報</h1>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative group">
                <select 
                className="h-10 pl-6 pr-10 bg-white border-2 border-gray-50 rounded-2xl text-sm font-black text-gray-600 focus:border-green-500 focus:ring-0 outline-none cursor-pointer shadow-sm transition-all hover:border-gray-200 appearance-none"
                value={selectedStoreId}
                onChange={(e) => {
                    setSelectedStoreId(e.target.value);
                    setCurrentPage(1);
                }}
                >
                <option value="all">全店舗</option>
                {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                {/* カスタム矢印アイコン */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"/></svg>
                </div>
            </div>
            <p className="text-sm text-gray-500 px-3 py-1">
              <span className="font-bold text-green-600">{totalLessonCount}</span> 件の実施済みレッスン履歴
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
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400 text-sm">データを読み込み中...</p>
            </div>
          ) : chartData?.series && chartData.series.length > 0 ? (
          <div className="flex items-end space-x-12 px-4 pb-5 min-w-max h-full">
              {chartData.series.map((d, i) => (
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
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400 text-sm">グラフデータがありません</p>
            </div>
          )}
        </div>
      </div>

      {/* 3. 履歴詳細テーブル */}
      <div className="bg-white rounded-[2rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full table-fixed divide-y divide-gray-50">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="w-[25%] px-8 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">レッスン日時</th>
                <th className="w-[25%] px-8 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">実施店舗</th>
                <th className="w-[25%] px-8 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">担当トレーナー名</th>
                <th className="w-[25%] px-8 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">顧客名</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white">
            {loading ? (
                <LoadingRow colSpan={4} />
              ) : recentLessons.length > 0 ? (
                recentLessons.map(lesson => <LessonCard key={lesson.id} lesson={lesson} />)
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

export default AdminDashboard;