import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { trainerHomeApi } from '../../api/trainer/homeApi';
import { Lesson } from '../../types/lesson';
import { ROUTES } from '../../constants/routes';
import { FiChevronRight, FiSearch, FiCalendar, FiUser, FiMapPin } from 'react-icons/fi';

export const TrainerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [nextLessons, setNextLessons] = useState<Lesson[]>([]);
  const [totalCount, setTotalCount] = useState(0); // 総件数
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0); // バックエンド側のページネーション用（0ベース）
  const [pageSize] = useState(10); // 1ページあたりの件数

  // fetchNextLessonsをuseCallbackでメモ化
  const fetchNextLessons = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);
    try {
      // GET /api/trainers/home を使用（1週間後～1ヶ月後までのレッスン予定をページネーション付きで取得）
      const data = await trainerHomeApi.getHome({
        page: currentPage,
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

  // 次のページを読み込む（バックエンド側のページネーション）
  const handleLoadMore = () => {
    setCurrentPage((prev) => prev + 1);
  };

  // 検索クエリが変更されたときにページをリセット
  useEffect(() => {
    if (searchQuery.trim() !== '') {
      setCurrentPage(0);
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

  // 初期ローディング
  if (loading && nextLessons.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#68BE6B]"></div>
      </div>
    );
  }

  return (
    <div className="p-8 font-poppins">
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-3xl font-semibold text-gray-800">レッスン日程</h1>
        {/* 次回レッスン希望日程件数 */}
        <div className="border border-[#DFDFDF] bg-white rounded-[10px] flex items-center px-6 h-[65px]">
          <FiCalendar className="text-[#68BE6B] mr-3 w-[29px] h-[29px]" />
          <p className="text-gray-700 text-[23px]">
            次回レッスン希望日程: <span className="font-semibold text-[#68BE6B]">{upcomingCount}</span>件
          </p>
        </div>
      </div>

      {/* 検索バー */}
      <div className="mb-6 flex justify-center">
        <div className="relative border border-[#DFDFDF] rounded-[35px] h-[70px] max-w-[95%] w-full">
          <FiSearch className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="名前を入力"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-full pl-14 pr-6 rounded-[35px] border-none focus:outline-none focus:ring-2 focus:ring-[#68BE6B] text-base"
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      {/* 次回レッスン希望日程一覧 */}
      <div className="space-y-6">
        {displayedLessons.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchQuery ? '検索結果がありません' : '次回レッスン希望日程がありません'}
          </div>
        ) : (
          Object.entries(groupedLessons).map(([date, lessonsForDate]) => (
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
                  className="group bg-white border border-[#DFDFDF] rounded-[15px] p-5 hover:shadow-md transition-shadow cursor-pointer flex items-center justify-between relative"
                >
                  {/* 右側の緑のアクセントバーと矢印 */}
                  <div className="absolute right-4 top-4 bottom-4 bg-[#68BE6B] rounded-full w-[30px] transition-transform group-hover:scale-105">
                    <FiChevronRight className="text-white absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex-shrink-0 w-7 h-7" />
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
          ))
        )}
      </div>

      {/* もっと見るボタン（バックエンド側のページネーション対応） */}
      {!searchQuery && (currentPage + 1) * pageSize < totalCount && (
        <div className="mt-6 text-center">
          <button
            onClick={handleLoadMore}
            className="px-8 py-3 rounded-lg bg-[#68BE6B] text-white font-medium hover:bg-[#5AB05D] transition-colors"
          >
            もっと見る
          </button>
        </div>
      )}
    </div>
  );
};
