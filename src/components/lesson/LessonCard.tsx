import React from 'react';
import { Lesson } from '../../types/lesson';

const formatDate = (dateStr?: string | null) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('ja-JP');
};

interface LessonCardProps {
  lesson: Lesson;
  onClick?: () => void;
}

export const LessonCard: React.FC<LessonCardProps> = ({ lesson, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="font-semibold">
            {formatDate(lesson.startDate)} {lesson.startDate && lesson.endDate && `- ${formatDate(lesson.endDate)}`}
          </p>
          <p className="text-sm text-gray-600">
            体重: {lesson.weight ? `${lesson.weight}kg` : '未記録'}
          </p>
        </div>
      </div>
      {lesson.memo && (
        <p className="mt-2 text-sm text-gray-600">{lesson.memo}</p>
      )}
    </div>
  );
};