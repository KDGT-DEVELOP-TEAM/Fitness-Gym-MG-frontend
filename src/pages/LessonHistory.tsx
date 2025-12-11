import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLessons } from '../hooks/useLesson';
import { formatDate, formatDateTime } from '../utils/dateFormatter';
import { ROUTES } from '../constants/routes';

export const LessonHistory: React.FC = () => {
  const { lessons, loading, error } = useLessons();
  const navigate = useNavigate();

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div>エラー: {error.message}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">レッスン履歴</h1>
      <div className="space-y-4">
        {lessons.map((lesson) => (
          <button
            key={lesson.id}
            type="button"
            onClick={() => navigate(`/lessons/${lesson.id}`)}
            className="w-full text-left p-4 border rounded-lg hover:border-green-400 transition"
          >
            <div className="flex justify-between">
              <div>
                {lesson.startDate && <p className="font-semibold">{formatDate(lesson.startDate)}</p>}
                <p className="text-sm text-gray-600">
                  {lesson.startDate ? formatDateTime(lesson.startDate) : ''}{' '}
                  {lesson.endDate ? ` - ${formatDateTime(lesson.endDate)}` : ''}
                </p>
              </div>
              {lesson.memo && <p className="text-sm">{lesson.memo}</p>}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

