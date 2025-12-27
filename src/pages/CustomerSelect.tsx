import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { lessonApi } from '../api/lessonApi';
import { AppointmentWithDetails } from '../types/lesson';
import { ROUTES } from '../constants/routes';
import { FiChevronRight, FiSearch, FiCalendar, FiUser, FiPhone, FiClock } from 'react-icons/fi';

export const CustomerSelect: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(10); // 初期表示件数

  // fetchAppointmentsをuseCallbackでメモ化
  const fetchAppointments = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);
    try {
      const data = await lessonApi.getInstructorAppointments(user.id);
      setAppointments(data);
    } catch (err) {
      setError('予約情報の取得に失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchAppointments();
    }
  }, [user?.id, fetchAppointments]);

  // useMemoで検索フィルタリングとスライスを最適化
  const displayedAppointments = useMemo(() => {
    if (searchQuery.trim() === '') {
      return appointments.slice(0, visibleCount);
    } else {
      const normalizedQuery = searchQuery.toLowerCase();
      const filtered = appointments.filter((apt) =>
        apt.customer.name.toLowerCase().includes(normalizedQuery)
      );
      return filtered.slice(0, visibleCount);
    }
  }, [appointments, searchQuery, visibleCount]);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 10);
  };

  const handleAppointmentClick = (customerId: string) => {
    navigate(ROUTES.LESSON_HISTORY.replace(':id', customerId));
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return '済み';
      case 'scheduled':
        return '予定';
      case 'cancelled':
        return 'キャンセル';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-[#E8D4E8] text-[#9B6B9B]';
      case 'scheduled':
        return 'bg-[#E8D4E8] text-[#9B6B9B]';
      case 'cancelled':
        return 'bg-[#E8D4E8] text-[#9B6B9B]';
      default:
        return 'bg-[#E8D4E8] text-[#9B6B9B]';
    }
  };

  const formatTime = (time: string) => {
    // "HH:mm:ss" -> "HH:mm"
    return time.substring(0, 5);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    const weekday = weekdays[date.getDay()];
    return `今日 ${month}月${day}日 (${weekday})`;
  };

  const calculateDuration = (startTime: string, endTime: string) => {
    const start = new Date(`2000-01-01 ${startTime}`);
    const end = new Date(`2000-01-01 ${endTime}`);
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.round(diffMs / 60000);
    return diffMins;
  };

  // 日付ごとにグループ化
  const groupedAppointments = displayedAppointments.reduce((acc, appointment) => {
    const date = appointment.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(appointment);
    return acc;
  }, {} as Record<string, AppointmentWithDetails[]>);

  const upcomingCount = appointments.filter(
    (apt) => apt.status === 'scheduled'
  ).length;

  // ユーザーがログインしていない場合
  if (!user) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 text-lg">ログインしてください</p>
      </div>
    );
  }

  // 初期ローディング
  if (loading && appointments.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#68BE6B]"></div>
      </div>
    );
  }

  return (
    <div className="p-8 font-poppins">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">顧客選択</h1>

      {/* これからの予約件数 */}
      <div className="mb-6">
        <div className="border border-[#DFDFDF] bg-white rounded-[10px] flex items-center px-6 h-[65px]">
          <FiCalendar className="text-[#68BE6B] mr-3 w-[29px] h-[29px]" />
          <p className="text-gray-700 text-[23px]">
            これからの予約: <span className="font-semibold text-[#68BE6B]">{upcomingCount}</span>件
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

      {/* 予約一覧 */}
      <div className="space-y-6">
        {displayedAppointments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchQuery ? '検索結果がありません' : '予約がありません'}
          </div>
        ) : (
          Object.entries(groupedAppointments).map(([date, appointmentsForDate]) => (
            <div key={date} className="space-y-3">
              {/* 日付セパレーター */}
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-[#68BE6B] text-white px-10 py-2 rounded-full font-medium text-sm whitespace-nowrap">
                  {formatDate(date)}
                </div>
                <div className="flex-1 h-0.5 bg-[#68BE6B]"></div>
              </div>

              {/* その日の予約リスト */}
              {appointmentsForDate.map((appointment) => (
                <div
                  key={appointment.id}
                  onClick={() => handleAppointmentClick(appointment.customer.id)}
                  className="group bg-white border border-[#DFDFDF] rounded-[15px] p-5 hover:shadow-md transition-shadow cursor-pointer flex items-center justify-between relative"
                >
                  {/* 右側の緑のアクセントバーと矢印 */}
                  <div className="absolute right-4 top-4 bottom-4 bg-[#68BE6B] rounded-full w-[30px] transition-transform group-hover:scale-105">
                    <FiChevronRight className="text-white absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex-shrink-0 w-7 h-7" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="bg-[#68BE6B] text-white px-6 py-1 rounded-full text-lg font-semibold">
                        {formatTime(appointment.startTime)}
                      </span>
                      <span
                        className={`px-4 py-1.5 rounded-full text-sm font-semibold ${getStatusColor(
                          appointment.status
                        )}`}
                      >
                        {getStatusLabel(appointment.status)}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <FiUser className="text-[#FAB7B7] w-[18px] h-[18px]" />
                        <p className="text-lg font-bold text-gray-900">
                          {appointment.customer.name}
                        </p>
                      </div>
                      {appointment.customer.phone && (
                        <div className="flex items-center gap-2">
                          <FiPhone className="text-[#FAB7B7] w-4 h-4" />
                          <p className="text-sm text-gray-600">
                            {appointment.customer.phone}
                          </p>
                        </div>
                      )}
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <div className="flex items-center gap-1 text-[#D3D3D3]">
                          <FiClock className="w-4 h-4" />
                          <span>
                            {calculateDuration(appointment.startTime, appointment.endTime)}分
                          </span>
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

      {/* もっと見るボタン */}
      {displayedAppointments.length < (searchQuery ? appointments.filter(apt => apt.customer.name.toLowerCase().includes(searchQuery.toLowerCase())).length : appointments.length) && (
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
