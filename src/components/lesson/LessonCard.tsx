import React from 'react';
import { Lesson } from '../../types/lesson';
import { formatDate, formatTime } from '../../utils/dateFormatter';

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
          <p className="font-semibold">{formatDate(lesson.date)}</p>
          <p className="text-sm text-gray-600">
            {formatTime(lesson.startTime)} - {formatTime(lesson.endTime)}
          </p>
        </div>
      </div>
      {lesson.notes && (
        <p className="mt-2 text-sm text-gray-600">{lesson.notes}</p>
      )}
    </div>
  );
};

