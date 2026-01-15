import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { trainerHomeApi } from '../../api/trainer/homeApi';
import { Lesson } from '../../types/lesson';
import { ROUTES } from '../../constants/routes';
import { Pagination } from '../../components/common/Pagination';
import { FiChevronRight, FiUser, FiMapPin } from 'react-icons/fi';
import { LoadingSpinner } from '../../components/common/TableStatusRows';

export const TrainerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [nextLessons, setNextLessons] = useState<Lesson[]>([]);
  const [totalCount, setTotalCount] = useState(0); // 総件数
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1); // フロントエンドは1ベース、バックエンドは0ベース
  const [pageSize] = useState(10); // 1ページあたりの件数

  // fetchNextLessonsをuseCallbackでメモ化
  const fetchNextLessons = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);
    try {
      // GET /api/trainers/home を使用（1週間後～1ヶ月後までのレッスン予定をページネーション付きで取得）
      const data = await trainerHomeApi.getHome({
        page: currentPage - 1, // フロントエンドは1ベース、バックエンドは0ベース
        size: pageSize,
      });
      
      // upcomingLessonsとtotalLessonCountを使用
      setNextLessons(data.upcomingLessons || []);
      setTotalCount(data.totalLessonCount || 0);
    } catch (err) {
      setError('次回レッスン希望日程の取得に失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, currentPage, pageSize]);

  useEffect(() => {
    if (user?.id) {
      fetchNextLessons();
    }
  }, [user?.id, fetchNextLessons]);

  // useMemoで検索フィルタリングを最適化
  const displayedLessons = useMemo(() => {
    if (searchQuery.trim() === '') {
      return nextLessons;
    } else {
      const normalizedQuery = searchQuery.toLowerCase();
      return nextLessons.filter((lesson) =>
        lesson.customerName.toLowerCase().includes(normalizedQuery)
      );
    }
  }, [nextLessons, searchQuery]);

  // 検索クエリが変更されたときにページをリセット
  useEffect(() => {
    if (searchQuery.trim() !== '') {
      setCurrentPage(1);
    }
  }, [searchQuery]);

  const handleLessonClick = (customerId: string) => {
    if (!customerId) {
      console.error('[TrainerDashboard] customerId is missing');
      return;
    }
    const url = ROUTES.LESSON_FORM_WITH_CUSTOMER.replace(':customerId', customerId);
    console.log('[TrainerDashboard] Navigating to:', url);
    navigate(url);
  };

  const formatTime = (dateTimeStr: string | null) => {
    if (!dateTimeStr) return '';
    const date = new Date(dateTimeStr);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes} 〜`;
  };

  const formatDate = (dateTimeStr: string | null) => {
    if (!dateTimeStr) return '';
    const date = new Date(dateTimeStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    const weekday = weekdays[date.getDay()];
    return `${month}月${day}日 (${weekday})`;
  };

  // 日付ごとにグループ化
  const groupedLessons = displayedLessons.reduce((acc, lesson) => {
    if (!lesson.nextDate) return acc;
    const date = lesson.nextDate.split('T')[0]; // ISO8601から日付部分を抽出
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(lesson);
    return acc;
  }, {} as Record<string, Lesson[]>);

  // 検索時はフィルタリング後の件数、検索無し時は総件数を使用
  const upcomingCount = searchQuery.trim() === '' ? totalCount : displayedLessons.length;

  // ユーザーがログインしていない場合
  if (!user) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 text-lg">ログインしてください</p>
      </div>
    );
  }

  // エラー表示
  if (error) return <div className="p-10 text-red-500 text-center font-bold">⚠️ {error}</div>;

  // 初期ローディング
  if (loading && nextLessons.length === 0) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <LoadingSpinner minHeight="min-h-[400px]" />
      </div>
    );
  }

  // 総ページ数の計算
  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* ヘッダー */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-wrap items-center gap-6">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">レッスン日程</h1>
          <p className="text-sm text-gray-500 px-3 py-1">
            次回レッスン希望日程: <span className="font-bold text-green-600">{upcomingCount}</span> 件
          </p>
        </div>
      </div>

      {/* 検索バー */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow group">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-400 group-focus-within:text-green-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="名前を入力"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-14 bg-white border-2 border-gray-50 pl-14 pr-6 rounded-2xl focus:border-green-500 focus:ring-0 outline-none transition-all text-gray-700 font-medium shadow-sm"
            maxLength={100}
          />
        </div>
      </div>

      {/* 次回レッスン希望日程一覧 */}
      {displayedLessons.length === 0 ? (
        <div className="bg-white rounded-[2rem] shadow-sm border-2 border-gray-50 p-12 text-center">
          <p className="text-gray-500 text-lg">
            {searchQuery ? '検索結果がありません' : '次回レッスン希望日程がありません'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedLessons).map(([date, lessonsForDate]) => (
            <div key={date} className="space-y-3">
              {/* 日付セパレーター */}
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-[#68BE6B] text-white px-10 py-2 rounded-full font-medium text-sm whitespace-nowrap">
                  {formatDate(lessonsForDate[0]?.nextDate || null)}
                </div>
                <div className="flex-1 h-0.5 bg-[#68BE6B]"></div>
              </div>

              {/* その日の次回レッスン希望日程リスト */}
              {lessonsForDate.map((lesson) => (
                <div
                  key={lesson.id}
                  onClick={() => handleLessonClick(lesson.customerId)}
                  className="group bg-white rounded-[2rem] shadow-sm border-2 border-gray-50 p-5 hover:bg-green-50/30 transition-colors cursor-pointer flex items-center justify-between relative"
                >
                  {/* 右側の緑のアクセントバーと矢印 */}
                  <div className="absolute right-4 top-4 bottom-4 bg-[#68BE6B] rounded-full w-[30px] transition-transform group-hover:scale-105 flex items-center justify-center">
                    <FiChevronRight className="text-white flex-shrink-0 w-7 h-7" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="bg-[#68BE6B] text-white px-6 py-1 rounded-full text-lg font-semibold">
                        {formatTime(lesson.nextDate)}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <FiUser className="text-[#FAB7B7] w-[18px] h-[18px]" />
                        <p className="text-lg font-bold text-gray-900">
                          {lesson.customerName}
                        </p>
                      </div>
                      {/* 前回と次回の店舗・担当情報を2列で表示 */}
                      <div className="grid grid-cols-2 gap-4 mt-3">
                        {/* 左列: 前回 */}
                        <div className="space-y-2">
                          {lesson.storeName && (
                            <div className="flex items-center gap-2">
                              <FiMapPin className="text-[#68BE6B] w-[18px] h-[18px]" />
                              <p className="text-base text-gray-700">
                                前回実施店舗: {lesson.storeName}
                              </p>
                            </div>
                          )}
                          {lesson.trainerName && (
                            <div className="flex items-center gap-2">
                              <FiUser className="text-[#68BE6B] w-[18px] h-[18px]" />
                              <p className="text-base text-gray-700">
                                前回担当: {lesson.trainerName}
                              </p>
                            </div>
                          )}
                        </div>
                        {/* 右列: 次回 */}
                        <div className="space-y-2">
                          {lesson.nextStoreName && (
                            <div className="flex items-center gap-2">
                              <FiMapPin className="text-[#68BE6B] w-[18px] h-[18px]" />
                              <p className="text-base text-gray-700">
                                実施店舗: {lesson.nextStoreName}
                              </p>
                            </div>
                          )}
                          {lesson.nextTrainerName && (
                            <div className="flex items-center gap-2">
                              <FiUser className="text-[#68BE6B] w-[18px] h-[18px]" />
                              <p className="text-base text-gray-700">
                                担当: {lesson.nextTrainerName}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* ページネーション */}
      {!searchQuery && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};
