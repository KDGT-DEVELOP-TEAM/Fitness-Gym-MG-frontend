import React from 'react';
import { Posture } from '../../types/posture';
import { formatDate } from '../../utils/dateFormatter';

interface PostureCardProps {
  posture: Posture;
  onClick?: () => void;
}

export const PostureCard: React.FC<PostureCardProps> = ({ posture, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
    >
      <img
        src={posture.imageUrl}
        alt="Posture"
        className="w-full h-48 object-cover rounded mb-2"
      />
      <p className="text-sm text-gray-600">{formatDate(posture.createdAt)}</p>
    </div>
  );
};

