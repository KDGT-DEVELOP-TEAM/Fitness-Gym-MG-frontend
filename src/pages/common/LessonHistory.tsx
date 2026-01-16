import React, { useState, useEffect, useMemo, useCallback, useRef, useLayoutEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiChevronRight, FiUser, FiClock } from 'react-icons/fi';
import { customerApi } from '../../api/customerApi';
import { lessonApi } from '../../api/lessonApi';
import { Lesson } from '../../types/lesson';
import { getErrorMessage } from '../../utils/errorMessages';
import axios from 'axios';
import { LoadingSpinner } from '../../components/common/TableStatusRows';

// 型定義
interface BMIHistoryItem {
  date: string; // X軸ラベル用（短い形式）
  dateFull: string; // ツールチップ用（完全な形式）
  bmi: number;
  weight: number;
  originalDate: Date; // 元の日付オブジェクト
}

// ページネーション用の定数
const ITEMS_PER_PAGE = 10;

export const LessonHistory: React.FC = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [lessonsLoading, setLessonsLoading] = useState(false);
  const [lessonsError, setLessonsError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDataPoint, setSelectedDataPoint] = useState<string | null>(null);
  const [customerHeight, setCustomerHeight] = useState<number>(189); // デフォルト値
  const [customerLoading, setCustomerLoading] = useState(true);
  const [customerError, setCustomerError] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // レッスン一覧と顧客情報を並列取得（重複実行を防止）
  const lastFetchKeyRef = useRef<string>('');
  const isFetchingRef = useRef<boolean>(false);
  useEffect(() => {
    const fetchData = async () => {
      if (!customerId) {
        setCustomerLoading(false);
        setLessonsLoading(false);
        return;
      }

      const fetchKey = customerId;
      
      // customerIdが変更された場合、前回の取得処理をリセット
      if (lastFetchKeyRef.current !== fetchKey) {
        isFetchingRef.current = false;
      }
      
      // 既に同じ条件で取得済み、または取得中の場合は実行しないガード
      if (lastFetchKeyRef.current === fetchKey || isFetchingRef.current) {
        return;
      }
      
      // 実行フラグを設定（非同期処理開始前に設定）
      lastFetchKeyRef.current = fetchKey;
      isFetchingRef.current = true;

      setLessonsLoading(true);
      setCustomerLoading(true);
      setLessonsError(null);
      setCustomerError(null);

      try {
        // レッスン一覧と顧客情報を並列取得
        const [lessonsResponse, customerResponse] = await Promise.all([
          lessonApi.getByCustomer(customerId),
          customerApi.getProfile(customerId)
        ]);

        setLessons(lessonsResponse.data || []);
        setCustomerHeight(customerResponse.height || 189);
      } catch (err) {
        // エラーが発生した場合、どちらのAPI呼び出しでエラーが発生したかを判定
        if (axios.isAxiosError(err)) {
          const errorMessage = err.response?.data?.message || err.message;
          setLessonsError(errorMessage);
          setCustomerError(errorMessage);
        } else if (err instanceof Error) {
          setLessonsError(err.message);
          setCustomerError(err.message);
        } else {
          setLessonsError('不明なエラーが発生しました');
          setCustomerError('不明なエラーが発生しました');
        }
      } finally {
        setLessonsLoading(false);
        setCustomerLoading(false);
        isFetchingRef.current = false;
      }
    };

    fetchData();
  }, [customerId]);

  // BMIデータを抽出（useMemoでメモ化）
  const bmiData = useMemo(() => {
    if (!lessons || lessons.length === 0) {
      return [];
    }

    const bmiHistory: BMIHistoryItem[] = lessons
      .filter((lesson) => lesson.bmi !== null && lesson.weight !== null && lesson.startDate)
      .map((lesson) => {
        const date = new Date(lesson.startDate);
        const formattedDate = `${date.getMonth() + 1}/${date.getDate()}`;
        const formattedDateFull = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;

        return {
          date: formattedDate,
          dateFull: formattedDateFull,
          dateTime: date.getTime(), // ソート用のタイムスタンプ
          bmi: lesson.bmi!,
          weight: lesson.weight!,
          originalDate: date,
        };
      })
      .sort((a, b) => a.dateTime - b.dateTime) // タイムスタンプでソート
      .map(({ dateTime, ...rest }) => rest); // タイムスタンプを削除

    return bmiHistory;
  }, [lessons]);

  // ページネーション処理
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentLessons = (lessons || []).slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil((lessons || []).length / ITEMS_PER_PAGE);

  // 日付ごとにグループ化
  const groupedLessons = useMemo(() => {
    return currentLessons.reduce((acc, lesson) => {
      if (!lesson.startDate) return acc;
      const date = new Date(lesson.startDate).toISOString().split('T')[0]; // YYYY-MM-DD形式
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(lesson);
      return acc;
    }, {} as Record<string, Lesson[]>);
  }, [currentLessons]);

  const formatDate = useCallback((dateStr: string) => {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    const weekday = weekdays[date.getDay()];
    return `${month}月${day}日 (${weekday})`;
  }, []);

  const formatTime = useCallback((dateTimeStr: string) => {
    if (!dateTimeStr) return '';
    const date = new Date(dateTimeStr);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }, []);

  const handleLessonClick = (lessonId: string) => {
    // レッスン詳細画面へ遷移（stateで遷移元を渡す）
    try {
      navigate(`/lesson/${lessonId}`, {
        state: { from: 'history' }
      });
    } catch (err) {
      console.log('Lesson clicked:', lessonId, 'Route may not be implemented yet');
    }
  };

  const getStatusColor = () => {
    return 'bg-[#E8D4E8] text-[#9B6B9B]';
  };

  // 初期BMI（最初のレッスンのBMI）
  const initialBMI = bmiData.length > 0 ? bmiData[0].bmi : null;

  // グラフの最新へのスクロール制御
  useLayoutEffect(() => {
    if (scrollContainerRef.current && bmiData.length > 0) {
      const scrollToEnd = () => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
        }
      };
      const rafId = requestAnimationFrame(scrollToEnd);
      return () => cancelAnimationFrame(rafId);
    }
  }, [bmiData]);

  // グラフの計算用定数
  const chartHeight = 384; // 256 * 1.5 = 384px
  const chartPadding = { top: 20, right: 100, bottom: 40, left: 40 }; // 右側のパディングを増やしてツールチップの余裕を確保
  const chartWidth = Math.max(1200, bmiData.length * 90); // 800 * 1.5 = 1200px、データポイントごとに90px
  const graphHeight = chartHeight - chartPadding.top - chartPadding.bottom;
  const graphWidth = chartWidth - chartPadding.left - chartPadding.right;
  const bmiMin = 18;
  const bmiMax = 40;
  const bmiRange = bmiMax - bmiMin;

  // BMI値からY座標を計算
  const getYPosition = (bmi: number) => {
    const normalized = (bmi - bmiMin) / bmiRange;
    return chartPadding.top + graphHeight - (normalized * graphHeight);
  };

  // X座標を計算（データポイント間の間隔）
  const getXPosition = (index: number) => {
    if (bmiData.length <= 1) return chartPadding.left;
    return chartPadding.left + (index / (bmiData.length - 1)) * graphWidth;
  };

  // スムーズな曲線のパスを生成（ベジェ曲線）
  const generatePath = () => {
    if (bmiData.length === 0) return '';
    if (bmiData.length === 1) {
      const x = getXPosition(0);
      const y = getYPosition(bmiData[0].bmi);
      return `M ${x} ${y}`;
    }

    const points = bmiData.map((data, i) => ({
      x: getXPosition(i),
      y: getYPosition(data.bmi),
    }));

    let path = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      const controlPoint1X = current.x + (next.x - current.x) / 2;
      const controlPoint1Y = current.y;
      const controlPoint2X = current.x + (next.x - current.x) / 2;
      const controlPoint2Y = next.y;
      path += ` C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${next.x} ${next.y}`;
    }

    return path;
  };

  // エリアのパスを生成（線の下を塗りつぶす）
  const generateAreaPath = () => {
    const linePath = generatePath();
    if (!linePath || bmiData.length === 0) return '';
    
    const firstX = getXPosition(0);
    const lastX = getXPosition(bmiData.length - 1);
    const bottomY = chartPadding.top + graphHeight;
    
    return `${linePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  };

  // ローディング表示
  const loading = lessonsLoading || customerLoading;
  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
        <LoadingSpinner />
      </div>
    );
  }

  // エラー表示
  const error = lessonsError || customerError;
  if (error) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
        <div className="bg-red-50 border-2 border-red-100 rounded-2xl p-6 text-center">
          <div className="text-red-600 text-lg font-bold mb-2">エラーが発生しました</div>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition-colors shadow-sm"
          >
            再読み込み
          </button>
        </div>
      </div>
    );
  }

  if (!customerId) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 text-center">
        <p className="text-red-600 text-lg">顧客IDが指定されていません</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* BMIの推移グラフ */}
      {bmiData.length > 0 && (
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border-2 border-gray-50">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">BMIの推移</h2>
            <div className="flex flex-col items-end">
              <span className="text-sm text-gray-600">身長: {customerHeight}cm</span>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-3 h-3 rounded-full bg-[#ED7D95]"></div>
                <span className="text-sm text-gray-600">BMI</span>
              </div>
            </div>
          </div>
          <div className="flex items-start">
            {/* Y軸の目盛り（左側、固定表示） */}
            {bmiData.length > 0 && (
              <div className="flex-shrink-0 h-96 relative pr-3" style={{ width: `${chartPadding.left}px` }}>
                {[40, 35, 30, 25, 20].map((value) => {
                  const y = getYPosition(value);
                  return (
                    <span
                      key={value}
                      className="absolute text-[10px] text-gray-400 font-black text-right pr-2"
                      style={{ top: `${y - 5}px`, width: `${chartPadding.left}px` }}
                    >
                      {value}
                    </span>
                  );
                })}
              </div>
            )}
            <div ref={scrollContainerRef} className="relative h-96 flex-1 overflow-x-auto scroll-smooth custom-scrollbar">
              {bmiData.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-400 text-sm">グラフデータがありません</p>
                </div>
              ) : (
                <div className="relative" style={{ width: `${chartWidth}px`, height: `${chartHeight}px`, minWidth: `${chartWidth}px` }}>
                  <svg width={chartWidth} height={chartHeight} className="absolute inset-0" style={{ minWidth: `${chartWidth}px` }}>
                  {/* グリッド線（BMI値5ずつ） */}
                  {[20, 25, 30, 35, 40].map((value) => {
                    const y = getYPosition(value);
                    return (
                      <line
                        key={value}
                        x1={chartPadding.left}
                        y1={y}
                        x2={chartWidth}
                        y2={y}
                        stroke="#D3D3D3"
                        strokeWidth={1}
                        strokeDasharray="3 3"
                      />
                    );
                  })}

                  {/* 初期BMIの基準線 */}
                  {initialBMI && (
                    <>
                      <line
                        x1={chartPadding.left}
                        y1={getYPosition(initialBMI)}
                        x2={chartWidth}
                        y2={getYPosition(initialBMI)}
                        stroke="#5B9BD5"
                        strokeWidth={2}
                        strokeDasharray="3 3"
                      />
                      <text
                        x={chartWidth - 5}
                        y={getYPosition(initialBMI) - 5}
                        fill="#5B9BD5"
                        fontSize="10"
                        fontWeight="bold"
                        textAnchor="end"
                      >
                        初期BMI
                      </text>
                    </>
                  )}

                  {/* BMIエリア（塗りつぶし） */}
                  <path
                    d={generateAreaPath()}
                    fill="#ED7D95"
                    fillOpacity={0.15}
                  />

                  {/* BMIライン */}
                  <path
                    d={generatePath()}
                    fill="none"
                    stroke="#ED7D95"
                    strokeWidth={2}
                  />

                  {/* データポイント */}
                  {bmiData.map((data, index) => {
                    const x = getXPosition(index);
                    const y = getYPosition(data.bmi);
                    const isSelected = selectedDataPoint === data.date;
                    
                    return (
                      <g 
                        key={index}
                        className="group cursor-pointer"
                        onClick={() => {
                          setSelectedDataPoint(prev => prev === data.date ? null : data.date);
                        }}
                      >
                        {/* データポイント（円形） */}
                        <circle
                          cx={x}
                          cy={y}
                          r={isSelected ? 12 : 10}
                          fill="#ED7D95"
                          stroke={isSelected ? '#fff' : 'none'}
                          strokeWidth={isSelected ? 3 : 0}
                          className="transition-all duration-200"
                          style={{
                            filter: 'drop-shadow(0 2px 4px rgba(237, 125, 149, 0.2))'
                          }}
                        />
                        {/* ホバー時の強調用の円 */}
                        <circle
                          cx={x}
                          cy={y}
                          r={12}
                          fill="#ED7D95"
                          fillOpacity={0}
                          className="opacity-0 group-hover:opacity-20 transition-opacity duration-200"
                        />
                        
                        {/* 日付の表示 */}
                        <text
                          x={x}
                          y={chartHeight - chartPadding.bottom + 15}
                          fill="#9CA3AF"
                          fontSize="10"
                          fontWeight="900"
                          textAnchor="middle"
                          className="uppercase tracking-tighter"
                        >
                          {data.date}
                        </text>
                        
                        {/* 選択時のツールチップ */}
                        {isSelected && (() => {
                          const tooltipWidth = 160;
                          const tooltipHeight = 100;
                          // ツールチップの位置を計算（デフォルトはデータポイントの中央）
                          let tooltipX = x - tooltipWidth / 2;
                          const tooltipY = y - tooltipHeight - 15;
                          
                          // 右端の境界（グラフの右端から少し内側）
                          const rightBoundary = chartWidth - 10; // 10pxの余裕
                          // 左端の境界
                          const leftBoundary = chartPadding.left;
                          
                          // 右端を超える場合は調整
                          if (tooltipX + tooltipWidth > rightBoundary) {
                            tooltipX = rightBoundary - tooltipWidth;
                          }
                          // 左端を超える場合は調整
                          if (tooltipX < leftBoundary) {
                            tooltipX = leftBoundary;
                          }
                          
                          // 三角形のポインターの位置を計算（データポイントを指すように）
                          const pointerX = Math.max(
                            tooltipX + 10, // 左端から10px以上
                            Math.min(x, tooltipX + tooltipWidth - 10) // 右端から10px以上、かつデータポイントの位置
                          );
                          
                          return (
                            <g className="pointer-events-none">
                              <polygon
                                points={`${pointerX},${y - 10} ${pointerX - 10},${y - 25} ${pointerX + 10},${y - 25}`}
                                fill="white"
                                stroke="#ED7D95"
                                strokeWidth={2}
                                filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
                              />
                              <foreignObject x={tooltipX} y={tooltipY} width={tooltipWidth} height={tooltipHeight}>
                                <div className="bg-white rounded-2xl px-5 py-4 border-2 border-[#ED7D95] shadow-sm text-center pointer-events-none flex flex-col justify-center items-center h-full w-full box-border">
                                  <div className="font-black text-[#ED7D95] mb-2 text-base whitespace-nowrap">{data.dateFull}</div>
                                  <div className="mb-1.5 text-sm font-bold text-gray-700">BMI: <span className="text-[#ED7D95]">{data.bmi.toFixed(1)}</span></div>
                                  <div className="text-sm font-bold text-gray-700">体重: <span className="text-[#ED7D95]">{data.weight}kg</span></div>
                                </div>
                              </foreignObject>
                            </g>
                          );
                        })()}
                      </g>
                    );
                  })}
                </svg>
              </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 履歴一覧 */}
      {lessons.length === 0 ? (
        <div className="bg-white rounded-[2rem] shadow-sm border-2 border-gray-50 p-12 text-center">
          <p className="text-gray-500 text-lg">レッスン履歴がありません</p>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {Object.entries(groupedLessons).map(([date, lessonsForDate]) => (
              <div key={date} className="space-y-3">
                {/* 日付セパレーター */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-[#68BE6B] text-white px-10 py-2 rounded-full font-medium text-sm whitespace-nowrap">
                    {formatDate(lessonsForDate[0].startDate)}
                  </div>
                  <div className="flex-1 h-0.5 bg-[#68BE6B]"></div>
                </div>

                {/* その日のレッスンリスト */}
                {lessonsForDate.map((lesson) => (
                  <div
                    key={lesson.id}
                    onClick={() => handleLessonClick(lesson.id)}
                    className="group bg-white rounded-[2rem] shadow-sm border-2 border-gray-50 p-5 hover:bg-green-50/30 transition-colors cursor-pointer flex items-center justify-between relative"
                  >
                    {/* 右側の緑のアクセントバーと矢印 */}
                    <div className="absolute right-4 top-4 bottom-4 bg-[#68BE6B] rounded-full w-[30px] transition-transform group-hover:scale-105 flex items-center justify-center">
                      <FiChevronRight className="text-white flex-shrink-0 w-7 h-7" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="bg-[#68BE6B] text-white px-6 py-1 rounded-full text-lg font-semibold">
                          {formatTime(lesson.startDate)}
                        </span>
                        <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${getStatusColor()}`}>
                          完了
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <FiUser className="text-[#FAB7B7] w-[18px] h-[18px]" />
                          <p className="text-lg font-bold text-gray-900">
                            {lesson.customerName}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <span className="font-medium">{lesson.storeName || '未設定'}</span>
                          <span>•</span>
                          <span>{lesson.trainerName || '未設定'}</span>
                          {lesson.startDate && lesson.endDate && (
                            <>
                              <span>•</span>
                              <div className="flex items-center gap-1 text-[#D3D3D3]">
                                <FiClock className="w-4 h-4" />
                                <span>
                                  {Math.round((new Date(lesson.endDate).getTime() - new Date(lesson.startDate).getTime()) / (1000 * 60))}分
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* ページネーション */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg bg-white border border-[#DFDFDF] text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                前へ
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 rounded-lg ${
                    currentPage === page
                      ? 'bg-[#68BE6B] text-white'
                      : 'bg-white border border-[#DFDFDF] text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg bg-white border border-[#DFDFDF] text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                次へ
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
