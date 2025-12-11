import React from 'react';
import { Lesson } from '../../types/lesson';
import { formatDate, formatDateTime } from '../../utils/dateFormatter';

interface LessonCardProps {
  lesson: Lesson;
  onClick?: () => void;
}

export const LessonCard: React.FC<LessonCardProps> = ({ lesson, onClick }) => {
  const start = lesson.startDate;
  const end = lesson.endDate;
  return (
    <div
      onClick={onClick}
      className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
    >
      <div className="flex justify-between items-start">
        <div>
          {start && <p className="font-semibold">{formatDate(start)}</p>}
          <p className="text-sm text-gray-600">
            {start ? formatDateTime(start) : ''} {end ? ` - ${formatDateTime(end)}` : ''}
          </p>
        </div>
      </div>
      {lesson.memo && <p className="mt-2 text-sm text-gray-600">{lesson.memo}</p>}
    </div>
  );
};

