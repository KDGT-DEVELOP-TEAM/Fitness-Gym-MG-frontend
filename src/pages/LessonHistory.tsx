import React from 'react';
import { useLessons } from '../hooks/useLesson';
import { formatDate } from '../utils/dateFormatter';

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
                <p className="font-semibold">{lesson.startDate ? formatDate(lesson.startDate) : '日付なし'}</p>
                <p className="text-sm text-gray-600">
                  {lesson.startDate && lesson.endDate ? `${lesson.startDate.substring(11, 16)} - ${lesson.endDate.substring(11, 16)}` : '時間なし'}
                </p>
              </div>
              {lesson.memo && <p className="text-sm">{lesson.memo}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
