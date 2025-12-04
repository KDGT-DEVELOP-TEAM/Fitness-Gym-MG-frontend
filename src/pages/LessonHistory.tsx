import React from 'react';
import { useLessons } from '../hooks/useLesson';
import { formatDate, formatTime } from '../utils/dateFormatter';

export const LessonHistory: React.FC = () => {
  const { lessons, loading, error } = useLessons();

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div>エラー: {error.message}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">レッスン履歴</h1>
      <div className="space-y-4">
        {lessons.map((lesson) => (
          <div key={lesson.id} className="p-4 border rounded-lg">
            <div className="flex justify-between">
              <div>
                <p className="font-semibold">{formatDate(lesson.date)}</p>
                <p className="text-sm text-gray-600">
                  {formatTime(lesson.startTime)} - {formatTime(lesson.endTime)}
                </p>
              </div>
              {lesson.notes && <p className="text-sm">{lesson.notes}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

