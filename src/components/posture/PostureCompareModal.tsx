import React from 'react';
import { PostureImage } from '../../types/posture';

interface PostureCompareModalProps {
  isOpen: boolean;
  compareImages: PostureImage[];
  onClose: () => void;
}

/**
 * Modal component for comparing two posture images side by side
 */
export const PostureCompareModal: React.FC<PostureCompareModalProps> = ({
  isOpen,
  compareImages,
  onClose,
}) => {
  if (!isOpen || compareImages.length !== 2) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-8 max-w-7xl w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">画像比較</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-3xl"
            type="button"
          >
            ×
          </button>
        </div>
        <div className="flex items-center gap-6">
          {/* 左側画像 */}
          <div className="flex-1">
            <div className="aspect-square bg-gray-100 rounded overflow-hidden mb-2">
              {compareImages[0].url ? (
                <img
                  src={compareImages[0].url}
                  alt="Before"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  画像なし
                </div>
              )}
            </div>
            <div className="bg-white px-4 py-3 rounded text-base text-gray-700">
              {compareImages[0].formattedDateTime || ''}
            </div>
          </div>
          {/* 中央矢印 */}
          <div className="text-6xl text-gray-400">→</div>
          {/* 右側画像 */}
          <div className="flex-1">
            <div className="aspect-square bg-gray-100 rounded overflow-hidden mb-2">
              {compareImages[1].url ? (
                <img
                  src={compareImages[1].url}
                  alt="After"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  画像なし
                </div>
              )}
            </div>
            <div className="bg-white px-4 py-3 rounded text-base text-gray-700">
              {compareImages[1].formattedDateTime || ''}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
