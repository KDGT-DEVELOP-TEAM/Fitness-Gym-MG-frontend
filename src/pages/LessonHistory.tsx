import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useLessonHistory } from '../hooks/useLessonHistory';
import { useStores } from '../hooks/useStore';
import { useAuth } from '../context/AuthContext';
import { LessonCard } from '../components/lesson/LessonCard';

const ITEMS_PER_PAGE = 10;

export const LessonHistory: React.FC = () => {
  const { user } = useAuth();
  const { stores } = useStores();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [selectedStoreId, setSelectedStoreId] = useState<'all' | string>(() => {
    if (user?.role === 'admin' || user?.role === 'trainer') return 'all';
    const sid = Array.isArray(user?.storeId) ? user?.storeId[0] : user?.storeId;
    return sid || 'all';
  });

  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [currentPage, setCurrentPage] = useState(1);
  
  const { history, loading, error } = useLessonHistory(selectedStoreId);

  // 1. 終了した（実施済み）レッスンのみを抽出するフィルタリング
  const completedHistory = useMemo(() => {
    const now = new Date();
    return history.filter(lesson => {
      const rawEnd = lesson.end_date || (lesson as any).endDate;
      if (!rawEnd) return false;
      return new Date(rawEnd) < now;
    });
  }, [history]);

  // 表示店舗名の取得ロジック
  const currentStoreDisplay = useMemo(() => {
    if (user?.role === 'admin') {
      if (selectedStoreId === 'all') return '全店舗';
      return stores.find(s => s.id === selectedStoreId)?.name || '店舗を選択中...';
    }
    if (user?.role === 'trainer') return '全店舗';
    const userStoreIds: string[] = Array.isArray(user?.storeId) 
      ? (user?.storeId as string[]) 
      : (user?.storeId ? [user.storeId as string] : []);
    const myStore = stores.find(s => userStoreIds.includes(s.id));
    return myStore ? myStore.name : '所属店舗の履歴';
  }, [user, stores, selectedStoreId]);

  // 2. グラフデータの生成（実施済みレッスンのみを使用）
  const { chartData, maxCount } = useMemo(() => {
    const counts: { [key: string]: number } = {};
    completedHistory.forEach(lesson => {
      const rawStart = lesson.start_date || (lesson as any).startDate;
      if (!rawStart) return;
      const d = new Date(rawStart);
      if (isNaN(d.getTime())) return;
      
      let label = "";
      if (viewMode === 'month') {
        label = `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}`;
      } else {
        const day = d.getDay();
        const diff = d.getDate() - (day === 0 ? 6 : day - 1);
        const monday = new Date(d);
        monday.setDate(diff);
        label = `${monday.getMonth() + 1}/${monday.getDate()}~`;
      }
      counts[label] = (counts[label] || 0) + 1;
    });

    const sortedLabels = Object.keys(counts).sort((a, b) => {
      const parse = (s: string) => s.includes('~') 
        ? new Date(2025, parseInt(s.split('/')[0]) - 1, parseInt(s.split('/')[1])).getTime()
        : new Date(s + "/01").getTime();
      return parse(a) - parse(b);
    });

    const data = sortedLabels.map(label => ({ label, count: counts[label] }));
    return { chartData: data, maxCount: Math.max(...data.map(d => d.count), 5) };
  }, [completedHistory, viewMode]);

  // 3. ページネーション（実施済みレッスンのみを使用）
  const { paginatedHistory, totalPages } = useMemo(() => {
    const pages = Math.ceil(completedHistory.length / ITEMS_PER_PAGE);
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return {
      paginatedHistory: completedHistory.slice(start, start + ITEMS_PER_PAGE),
      totalPages: pages || 1
    };
  }, [completedHistory, currentPage]);

  useEffect(() => { setCurrentPage(1); }, [completedHistory.length, selectedStoreId]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      setTimeout(() => {
        scrollContainerRef.current!.scrollLeft = scrollContainerRef.current!.scrollWidth;
      }, 100);
    }
  }, [chartData]);

  if (error) return <div className="p-10 text-red-500 text-center font-bold">Error: {error}</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* ヘッダー */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-3">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">統計情報</h1>
          <div className="flex flex-wrap items-center gap-3">
            {/* ロールに応じた店舗表示エリア */}
            <div className="flex items-center">
              {user?.role === 'admin' ? (
                /* 管理者は選択可能 */
                <div className="relative group">
                  <select 
                    className="h-10 pl-6 pr-10 bg-white border-2 border-gray-50 rounded-2xl text-sm font-black text-gray-600 focus:border-green-500 focus:ring-0 outline-none cursor-pointer shadow-sm transition-all hover:border-gray-200 appearance-none"
                    value={selectedStoreId}
                    onChange={(e) => setSelectedStoreId(e.target.value)}
                  >
                    <option value="all">全店舗</option>
                    {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  {/* カスタム矢印アイコン */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"/></svg>
                  </div>
                </div>
              ) : (
                /* 店長・トレーナーは表示のみ（管理者用セレクトボックスと同じデザインの枠） */
                <div className="h-10 px-6 bg-white border-2 border-gray-50 rounded-2xl text-sm font-black text-gray-600 flex items-center outline-none shadow-sm">
                  <svg className="w-3.5 h-3.5 mr-2 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  {currentStoreDisplay}
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500 px-3 py-1">
              <span className="font-bold text-green-600">{completedHistory.length}</span> 件の実施済みレッスン履歴
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
            {chartData.map((d, i) => (
              <div key={i} className="flex flex-col items-center w-12 h-full justify-end group">
                <span className="text-[10px] font-black text-green-500 mb-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0">{d.count}</span>
                <div 
                  className="w-10 bg-green-500/10 group-hover:bg-green-500 rounded-t-lg transition-all duration-300 relative"
                  style={{ height: `${(d.count / maxCount) * 75}%` }}
                >
                  <div className="absolute inset-0 bg-green-500 rounded-t-lg opacity-20 group-hover:opacity-100 transition-opacity" />
                </div>
                <span className="text-[10px] text-gray-400 mt-4 font-black whitespace-nowrap uppercase tracking-tighter">{d.label}</span>
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
                <th className="w-[25%] px-8 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">実施店舗</th>
                <th className="w-[25%] px-8 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">担当トレーナー名</th>
                <th className="w-[25%] px-8 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">顧客名</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-24 text-center">
                    <div className="animate-spin h-10 w-10 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Synchronizing History...</p>
                  </td>
                </tr>
              ) : paginatedHistory.length > 0 ? (
                paginatedHistory.map((lesson) => <LessonCard key={lesson.id} lesson={lesson} />)
              ) : (
                <tr>
                  <td colSpan={4} className="py-24 text-center text-gray-400 font-medium italic">
                    実施済みのレッスン履歴が見つかりませんでした。
                  </td>
                </tr>
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

export default LessonHistory;