import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { FiChevronRight, FiUser, FiClock } from 'react-icons/fi';
import { lessonApi } from '../api/lessonApi';
import { customerApi } from '../api/customerApi';
import { getErrorMessage } from '../utils/errorMessages';
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

// 型定義
interface LessonHistoryItem {
  id: string;
  date: string;
  dayOfWeek: string;
  startTime: string;
  status: string;
  customerName: string;
  shopName: string;
}

interface BMIHistoryItem {
  date: string;
  bmi: number;
  weight: number;
}

// 初期BMI（基準点）
const initialBMI = 23.5;

export const LessonHistory: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lessonHistory, setLessonHistory] = useState<LessonHistoryItem[]>([]);
  const [bmiData, setBmiData] = useState<BMIHistoryItem[]>([]);
  const [selectedDataPoint, setSelectedDataPoint] = useState<string | null>(null);
  const [customerHeight, setCustomerHeight] = useState<number>(189); // デフォルト値
  const itemsPerPage = 10;

  // データ取得
  const fetchData = useCallback(async () => {
    if (!id) {
      setError('顧客IDが指定されていません。');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 顧客情報を取得（身長を取得）
      const customer = await customerApi.getById(id);
      const height = customer.height || 189; // デフォルト189cm
      setCustomerHeight(height);

      // 実際のAPIからレッスンデータを取得
      const lessons = await lessonApi.getByCustomerId(id);

      // レッスンデータを変換してセット
      const formattedLessons: LessonHistoryItem[] = lessons.map((lesson) => ({
        id: lesson.id,
        date: lesson.startDate || '',
        dayOfWeek: lesson.startDate ? new Date(lesson.startDate).toLocaleDateString('ja-JP', { weekday: 'short' }) : '',
        startTime: lesson.startDate ? new Date(lesson.startDate).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }) : '',
        status: '完了',
        customerName: lesson.customerId || '',
        shopName: lesson.storeId || '',
      }));
      setLessonHistory(formattedLessons);

      // BMIデータを計算（体重が記録されているレッスンのみ）
      const bmiHistory: BMIHistoryItem[] = lessons
        .filter((lesson) => lesson.weight && lesson.startDate)
        .map((lesson) => {
          const weight = lesson.weight!;
          const heightInMeters = height / 100;
          const bmi = parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));
          const date = new Date(lesson.startDate!);
          const formattedDate = `${date.getMonth() + 1}/${date.getDate()}`;

          return {
            date: formattedDate,
            bmi: bmi,
            weight: weight,
          };
        })
        .sort((a, b) => {
          // 日付順にソート
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateA.getTime() - dateB.getTime();
        });

      setBmiData(bmiHistory);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ページネーション処理
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLessons = lessonHistory.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(lessonHistory.length / itemsPerPage);

  // 日付ごとにグループ化（useMemoで最適化）
  const groupedLessons = useMemo(() => {
    return currentLessons.reduce((acc, lesson) => {
      const date = lesson.date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(lesson);
      return acc;
    }, {} as Record<string, LessonHistoryItem[]>);
  }, [currentLessons]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}月${day}日`;
  };

  const handleLessonClick = (lessonId: string) => {
    // レッスン詳細画面へ遷移
    console.log('Lesson clicked:', lessonId);
  };

  const getStatusColor = (status: string) => {
    return 'bg-[#E8D4E8] text-[#9B6B9B]';
  };

  // ローディング表示
  if (loading) {
    return (
      <div className="p-8 font-poppins">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#68BE6B] mb-4"></div>
            <p className="text-gray-600">データを読み込んでいます...</p>
          </div>
        </div>
      </div>
    );
  }

  // エラー表示
  if (error) {
    return (
      <div className="p-8 font-poppins">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 text-lg font-semibold mb-2">エラーが発生しました</div>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            再読み込み
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 font-poppins">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">身長: {customerHeight}cm</h1>

      {/* BMIの推移グラフ */}
      <div className="mb-8 bg-white border border-[#DFDFDF] rounded-[15px] p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">BMIの推移</h2>
        <ResponsiveContainer width="100%" height={600}>
          <ComposedChart
            data={bmiData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
            <XAxis
              dataKey="date"
              stroke="#666"
              style={{ fontSize: '14px' }}
            />
            <YAxis
              yAxisId="left"
              stroke="#666"
              domain={[18, 40]}
              ticks={[18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40]}
              interval={0}
              style={{ fontSize: '14px' }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#666"
              domain={[18, 40]}
              style={{ fontSize: '14px' }}
            />
            <Tooltip content={() => null} cursor={false} />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
            />
            {/* 初期BMIの基準線 */}
            <ReferenceLine
              y={initialBMI}
              yAxisId="left"
              stroke="#5B9BD5"
              strokeDasharray="3 3"
              label={{ value: '初期BMI', position: 'insideTopRight', fill: '#5B9BD5' }}
            />
            {/* BMIエリア（塗りつぶし） */}
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="bmi"
              fill="#ED7D95"
              fillOpacity={0.15}
              stroke="none"
              legendType="none"
              activeDot={false}
              isAnimationActive={false}
            />
            {/* BMIライン */}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="bmi"
              stroke="#ED7D95"
              strokeWidth={2}
              isAnimationActive={false}
              dot={(props: any) => {
                const { cx, cy, payload } = props;
                const isSelected = selectedDataPoint === payload?.date;
                return (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isSelected ? 12 : 10}
                    fill="#ED7D95"
                    stroke={isSelected ? '#fff' : 'none'}
                    strokeWidth={isSelected ? 3 : 0}
                    style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                    onClick={() => {
                      if (payload && payload.date) {
                        setSelectedDataPoint(prev => prev === payload.date ? null : payload.date);
                      }
                    }}
                  />
                );
              }}
              activeDot={false}
              name="BMI"
              label={(props: any) => {
                const { x, y, index } = props;
                const dataPoint = bmiData[index];
                if (!dataPoint || !dataPoint.date) return null;
                if (selectedDataPoint === dataPoint.date) {
                  return (
                    <g className="pointer-events-none">
                      {/* 吹き出しの三角形 */}
                      <polygon
                        points={`${x},${y - 10} ${x - 8},${y - 20} ${x + 8},${y - 20}`}
                        fill="#68BE6B"
                        filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
                      />
                      <foreignObject x={x - 65} y={y - 100} width="130" height="80">
                        <div className="bg-[#68BE6B] rounded-xl px-3.5 py-2.5 text-white text-[13px] shadow-lg text-center pointer-events-none flex flex-col justify-center items-center h-full w-full box-border">
                          <div className="font-semibold mb-1 text-sm">{dataPoint.date}</div>
                          <div className="mb-0.5 text-sm">BMI: {dataPoint.bmi}</div>
                          <div className="text-sm">体重: {dataPoint.weight}kg</div>
                        </div>
                      </foreignObject>
                    </g>
                  );
                }
                return null;
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* 履歴一覧 */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">履歴一覧</h2>
      </div>

      {lessonHistory.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <p className="text-gray-500 text-lg">レッスン履歴がありません</p>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {(Object.entries(groupedLessons) as [string, any[]][]).map(([date, lessonsForDate]) => (
          <div key={date} className="space-y-3">
            {/* 日付セパレーター */}
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-[#68BE6B] text-white px-10 py-2 rounded-full font-medium text-sm whitespace-nowrap">
                {formatDate(date)} ({lessonsForDate[0].dayOfWeek})
              </div>
              <div className="flex-1 h-0.5 bg-[#68BE6B]"></div>
            </div>

            {/* その日のレッスンリスト */}
            {lessonsForDate.map((lesson) => (
              <div
                key={lesson.id}
                onClick={() => handleLessonClick(lesson.id)}
                className="group bg-white border border-[#DFDFDF] rounded-[15px] p-5 hover:shadow-md transition-shadow cursor-pointer flex items-center justify-between relative"
              >
                {/* 右側の緑のアクセントバーと矢印 */}
                <div className="absolute right-4 top-4 bottom-4 bg-[#68BE6B] rounded-full w-[30px] transition-transform group-hover:scale-105">
                  <FiChevronRight className="text-white absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex-shrink-0 w-7 h-7" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="bg-[#68BE6B] text-white px-6 py-1 rounded-full text-lg font-semibold">
                      {lesson.startTime}
                    </span>
                    <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${getStatusColor(lesson.status)}`}>
                      {lesson.status}
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
                      <span className="font-medium">{lesson.shopName}</span>
                      <span>•</span>
                      <span>チェスト</span>
                      <span>•</span>
                      <div className="flex items-center gap-1 text-[#D3D3D3]">
                        <FiClock className="w-4 h-4" />
                        <span>120分</span>
                      </div>
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
