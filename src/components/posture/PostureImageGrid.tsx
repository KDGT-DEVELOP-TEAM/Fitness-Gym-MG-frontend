import React, { useMemo, useState } from 'react';
import { PostureImage } from '../../types/posture';
import { groupByDate, formatDateForDisplay } from '../../utils/dateFormatter';
import { COLOR_CLASSES } from '../../constants/colors';
import { PosturePosition } from '../../constants/posture';

const positionLabels: Record<PosturePosition, string> = {
  front: 'Front',
  right: 'Right',
  back: 'Back',
  left: 'Left',
};

const positionColors: Record<PosturePosition, string> = {
  front: `${COLOR_CLASSES.PRIMARY_PINK} text-black`,
  right: `${COLOR_CLASSES.PRIMARY_PINK} text-black`,
  back: `${COLOR_CLASSES.PRIMARY_PINK} text-black`,
  left: `${COLOR_CLASSES.PRIMARY_PINK} text-black`,
};

// mock-storage.example.comのURLを検出する関数
const isMockUrl = (url: string | undefined): boolean => {
  return url ? url.includes('mock-storage.example.com') : false;
};

// 画像表示用のコンポーネント
const ImageDisplay: React.FC<{ image: PostureImage }> = ({ image }) => {
  const [imageError, setImageError] = useState(false);
  
  // mock URLまたはURLがない場合はプレースホルダーを表示
  if (!image.url || isMockUrl(image.url) || imageError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400">
        <div className="text-sm mb-1">画像なし</div>
        <div className="text-xs">{positionLabels[image.position]}</div>
      </div>
    );
  }
  
  return (
    <img
      src={image.url}
      alt={positionLabels[image.position]}
      className="w-full h-full object-cover"
      loading="lazy"
      onError={() => {
        setImageError(true);
      }}
    />
  );
};

interface PostureImageGridProps {
  images: PostureImage[];
  isSelectionMode: boolean;
  selectedImageIds: Set<string>;
  onToggleSelection: (imageId: string) => void;
}

/**
 * Grid component for displaying posture images grouped by date
 */
export const PostureImageGrid: React.FC<PostureImageGridProps> = ({
  images,
  isSelectionMode,
  selectedImageIds,
  onToggleSelection,
}) => {
  const groupedImages = useMemo(() => {
    return groupByDate(images);
  }, [images]);

  if (groupedImages.size === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        画像がありません
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {Array.from(groupedImages.entries()).map(([dateKey, dateImages]) => (
        <div key={dateKey} className="w-full">
          {/* 日付ヘッダー */}
          <div
            data-date-key={dateKey}
            className="mb-3 flex items-center w-full"
          >
            <span className={`${COLOR_CLASSES.PRIMARY_GREEN} text-white px-4 py-2 rounded-full whitespace-nowrap flex-shrink-0`}>
              {dateKey}
            </span>
            <div
              data-line-element
              className={`flex-1 h-[2px] ${COLOR_CLASSES.PRIMARY_GREEN} ml-2 shadow-[0_0_4px_rgba(104,190,107,0.5)]`}
            />
          </div>
          {/* 画像グリッド */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {dateImages.map((image) => {
              const isSelected = selectedImageIds.has(image.id);
              
              return (
                <div
                  key={image.id}
                  onClick={() => onToggleSelection(image.id)}
                  className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer transition-all shadow-md ${
                    isSelected
                      ? `ring-4 ${COLOR_CLASSES.PRIMARY_PINK.replace('bg-', 'ring-')}`
                      : ''
                  } ${!isSelectionMode ? 'cursor-default' : ''}`}
                >
                  <ImageDisplay image={image} />
                  {/* 下部オーバーレイ */}
                  <div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-60 rounded-b-lg px-4 py-4 flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-800">
                      {image.takenAt ? formatDateForDisplay(image.takenAt) : ''}
                    </div>
                    <div
                      className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${positionColors[image.position]}`}
                    >
                      {positionLabels[image.position]}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
