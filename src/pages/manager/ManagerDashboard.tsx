import React, { useState, useRef, useEffect, useLayoutEffect, useMemo } from 'react';
import { useStores } from '../../hooks/useStore';
import { useAuth } from '../../context/AuthContext';
import { DashboardLessonCard } from '../../components/lesson/DashboardLessonCard';
import { managerHomeApi } from '../../api/manager/homeApi';
import { LoadingRow, EmptyRow, LoadingSpinner } from '../../components/common/TableStatusRows';
import { ManagerHomeResponse } from '../../types/manager/home';

const ITEMS_PER_PAGE = 10;

export const ManagerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { stores, loading: storesLoading } = useStores();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [homeData, setHomeData] = useState<ManagerHomeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [selectedStoreId, setSelectedStoreId] = useState<string>('');

  // マネージャーがアクセス可能な店舗のリスト
  const accessibleStores = useMemo(() => {
    if (!stores || stores.length === 0) return [];
    // MANAGERの場合は全店舗を表示（ADMINと同じ）
    return stores;
  }, [stores]);

  // 初期値の設定
  useEffect(() => {
    if (storesLoading) return; // storesの読み込みが完了するまで待つ
    
    if (!selectedStoreId) {
      // 優先順位1: マネージャーの所属店舗を優先
      if (user?.storeIds && user.storeIds.length > 0) {
        const userStoreId = Array.isArray(user.storeIds) ? user.storeIds[0] : user.storeIds;
        // 所属店舗がaccessibleStoresに含まれているか確認
        if (accessibleStores.length > 0) {
          const isValidStore = accessibleStores.some(s => s.id === userStoreId);
          if (isValidStore) {
            setSelectedStoreId(userStoreId);
            return;
          }
        } else {
          // storesがまだ読み込まれていない場合でも、user.storeIdsを信頼して設定
          setSelectedStoreId(userStoreId);
          return;
        }
      }
      
      // 優先順位2: フォールバック（所属店舗が取得できない場合）
      if (accessibleStores.length > 0) {
        setSelectedStoreId(accessibleStores[0].id);
      }
    }
  }, [user?.storeIds, stores, storesLoading, accessibleStores, selectedStoreId]);

  // --- Home API 呼び出し ---
  useEffect(() => {
    // storesの読み込みが完了するまで待つ
    if (storesLoading) {
      // storesLoading中はローディング状態を維持し、エラーメッセージは表示しない
      setLoading(true);
      setApiError(null);
      return;
    }

    if (!selectedStoreId) {
      // storesLoadingが完了し、かつselectedStoreIdが取得できない場合のみエラーメッセージを表示
      setLoading(false);
      setApiError('店舗IDが取得できませんでした。ログイン情報を確認してください。');
      return;
    }

    setLoading(true);
    setApiError(null);

    managerHomeApi.getHome(selectedStoreId, {
      chartType: viewMode,
      page: currentPage - 1, // フロントエンドは1ベース、バックエンドは0ベース
      size: ITEMS_PER_PAGE,
    })
      .then(data => {
        setHomeData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Manager Home API Fetch Error:", err);
        setApiError("ダッシュボードデータの取得に失敗しました。");
        setLoading(false);
      });
  }, [selectedStoreId, viewMode, currentPage, storesLoading]);

  const currentStoreName = useMemo(() => {
    return stores.find(s => s.id === selectedStoreId)?.name || '所属店舗';
  }, [stores, selectedStoreId]);

  // selectedStoreId や viewMode 変更時にページリセット
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStoreId, viewMode]);

  // homeDataからデータを取得
  const chartData = homeData?.chartData || null;
  const recentLessons = homeData?.recentLessons || [];
  const totalLessonCount = homeData?.totalLessonCount || 0;

  const handleViewModeChange = (mode: 'week' | 'month') => {
    setViewMode(mode);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalLessonCount / ITEMS_PER_PAGE) || 1;

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

  // エラー表示
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-wrap items-center gap-6">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">統計情報</h1>
          <div className="relative group">
            <select 
              className="h-10 pl-6 pr-10 bg-white border-2 border-gray-50 rounded-2xl text-sm font-black text-gray-600 focus:border-green-500 focus:ring-0 outline-none cursor-pointer shadow-sm transition-all hover:border-gray-200 appearance-none"
              value={selectedStoreId}
              onChange={(e) => {
                setSelectedStoreId(e.target.value);
                setCurrentPage(1);
              }}
              disabled={storesLoading || accessibleStores.length === 0}
            >
              {accessibleStores.length === 0 ? (
                <option value="">店舗を読み込み中...</option>
              ) : (
                accessibleStores.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))
              )}
            </select>
            {/* カスタム矢印アイコン */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"/>
              </svg>
            </div>
          </div>
          <p className="text-sm text-gray-500 px-3 py-1">
            <span className="font-bold text-green-600">{totalLessonCount}</span> 件の実施済みレッスン履歴
          </p>
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
            <LoadingSpinner minHeight="h-full" className="py-0" />
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
                <th className="w-[25%] px-8 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">担当トレーナー名</th>
                <th className="w-[25%] px-8 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">顧客名</th>
                <th className="w-[25%] px-8 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">実施店舗</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white">
            {loading ? (
                <LoadingRow colSpan={4} />
              ) : recentLessons.length > 0 ? (
                recentLessons.map(lesson => <DashboardLessonCard key={lesson.id} lesson={lesson} from="home" />)
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