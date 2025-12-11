import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FiChevronRight, FiUser } from 'react-icons/fi';
import { lessonApi } from '../api/lessonApi';
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

// アイコンコンポーネント
const ChevronRightIcon = (props: { className?: string }) => {
  const Icon = FiChevronRight as any;
  return <Icon {...props} />;
};

const UserIcon = (props: { className?: string }) => {
  const Icon = FiUser as any;
  return <Icon {...props} />;
};

// 仮データ - BMI/体重データ
const mockBMIData = [
  { date: '10/01', weight: 67, bmi: 21.5 },
  { date: '10/08', weight: 67, bmi: 22.0 },
  { date: '10/15', weight: 67, bmi: 22.0 },
  { date: '10/22', weight: 67, bmi: 22.5 },
];

// 初期BMI（基準点）
const initialBMI = 23.5;

// 仮データ - レッスン履歴
const mockLessonHistory = [
  {
    id: '1',
    date: '2024-10-99',
    dayOfWeek: '火',
    startTime: '10:00',
    endTime: '11:00',
    customerName: '色黄猛介',
    shopName: '新宿店',
    status: '済み',
  },
  {
    id: '2',
    date: '2024-10-99',
    dayOfWeek: '火',
    startTime: '10:00',
    endTime: '11:00',
    customerName: '色黄猛介',
    shopName: '新宿店',
    status: '済み',
  },
  {
    id: '3',
    date: '2024-11-01',
    dayOfWeek: '日',
    startTime: '10:00',
    endTime: '11:00',
    customerName: '色黄猛介',
    shopName: '新宿店',
    status: '済み',
  },
  {
    id: '4',
    date: '2024-11-01',
    dayOfWeek: '日',
    startTime: '10:00',
    endTime: '11:00',
    customerName: '色黄猛介',
    shopName: '新宿店',
    status: '済み',
  },
];

export const LessonHistory: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lessonHistory, setLessonHistory] = useState(mockLessonHistory);
  const [bmiData, setBmiData] = useState(mockBMIData);
  const itemsPerPage = 10;

  // データ取得
  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError('顧客IDが指定されていません。');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // TODO: 実際のAPIからデータを取得
        // const lessons = await lessonApi.getByCustomerId(id);
        // setLessonHistory(lessons);

        // TODO: BMIデータの取得APIを実装
        // const bmiHistory = await customerApi.getBMIHistory(id);
        // setBmiData(bmiHistory);

        // 開発中はモックデータを使用
        await new Promise(resolve => setTimeout(resolve, 500)); // API呼び出しをシミュレート
        setLessonHistory(mockLessonHistory);
        setBmiData(mockBMIData);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // ページネーション処理
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLessons = lessonHistory.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(lessonHistory.length / itemsPerPage);

  // 日付ごとにグループ化
  const groupedLessons = currentLessons.reduce((acc, lesson) => {
    const date = lesson.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(lesson);
    return acc;
  }, {} as Record<string, typeof mockLessonHistory>);

  const formatDate = (dateStr: string) => {
    const [, month, day] = dateStr.split('-');
    return `一昨日 ${month}月${day}日`;
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
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">身長: 189cm</h1>

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
            <Tooltip
              contentStyle={{
                backgroundColor: '#68BE6B',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 12px',
                color: 'white',
                whiteSpace: 'pre-line'
              }}
              labelStyle={{ color: 'white', fontWeight: 'bold' }}
              itemStyle={{ color: 'white' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length > 0) {
                  const data = payload[0].payload;
                  return (
                    <div style={{
                      backgroundColor: '#68BE6B',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: 'white'
                    }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{data.date}</div>
                      <div>BMI: {data.bmi}</div>
                      <div>体重: {data.weight}kg</div>
                    </div>
                  );
                }
                return null;
              }}
            />
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
              dot={{ fill: '#ED7D95', r: 4 }}
              activeDot={{ r: 6 }}
              name="BMI"
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
            {Object.entries(groupedLessons).map(([date, lessonsForDate]) => (
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
                  <ChevronRightIcon className="text-white absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex-shrink-0 w-7 h-7" />
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
                      <UserIcon className="text-[#FAB7B7] w-[18px] h-[18px]" />
                      <p className="text-lg font-bold text-gray-900">
                        {lesson.customerName}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <span className="font-medium">{lesson.shopName}</span>
                      <span>•</span>
                      <span>チェスト</span>
                      <span>•</span>
                      <span>
                        {lesson.startTime} - {lesson.endTime}
                      </span>
                      <span>•</span>
                      <span>120分</span>
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
