import React, { useMemo, useState, useEffect, useRef } from 'react';
import { PostureImage } from '../../types/posture';
import { groupByDate, formatDateForDisplay } from '../../utils/dateFormatter';
import { COLOR_CLASSES } from '../../constants/colors';
import { PosturePosition } from '../../constants/posture';
import { logger } from '../../utils/logger';

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

// URLが有効かどうかを検証する関数（ログ出力なし、パフォーマンス最適化）
const isValidImageUrl = (url: string | undefined): boolean => {
  if (!url || url.trim() === '') {
    return false;
  }
  
  // 相対パス（/で始まる）の場合は無効
  if (url.startsWith('/')) {
    return false;
  }
  
  // http://またはhttps://で始まる場合は有効
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return true;
  }
  
  // その他の場合は無効
  return false;
};

// 画像表示用のコンポーネント
const ImageDisplay: React.FC<{ image: PostureImage }> = ({ image }) => {
  const [imageError, setImageError] = useState(false);
  const hasLoggedInvalidUrl = useRef(false);
  const hasLoggedError = useRef(false);
  
  // URLの検証: 有効なURLでない場合はプレースホルダーを表示
  const urlIsValid = isValidImageUrl(image.url);
  
  // URLが無効な場合のログ（初回のみ、useEffectで制御）
  useEffect(() => {
    if (!urlIsValid && image.url && !hasLoggedInvalidUrl.current) {
      hasLoggedInvalidUrl.current = true;
      logger.warn('Image URL is invalid, showing placeholder', {
        imageId: image.id,
        position: image.position,
        url: image.url.substring(0, 100),
        storageKey: image.storageKey,
        urlIsRelative: image.url.startsWith('/')
      }, 'PostureImageGrid');
    }
  }, [urlIsValid, image.url, image.id, image.position, image.storageKey]);
  
  // mock URL、無効なURL、またはエラーが発生した場合はプレースホルダーを表示
  if (!urlIsValid || isMockUrl(image.url) || imageError) {
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
      onError={(e) => {
        // エラーログを出力（各画像ごとに1回のみ）
        if (!hasLoggedError.current) {
          hasLoggedError.current = true;
          // エラーの詳細情報を抽出（循環参照を避ける）
          const errorInfo: Record<string, unknown> = {
            imageId: image.id,
            position: image.position,
            storageKey: image.storageKey,
            url: image.url || 'N/A',
            urlLength: image.url?.length || 0,
            urlIsAbsolute: image.url ? (image.url.startsWith('http://') || image.url.startsWith('https://')) : false,
            urlIsRelative: image.url ? image.url.startsWith('/') : false,
            urlStartsWith: image.url ? image.url.substring(0, Math.min(100, image.url.length)) : 'N/A',
            urlEndsWith: image.url && image.url.length > 50 ? '...' + image.url.substring(image.url.length - 50) : image.url || 'N/A'
          };
          
          // エラーイベントの基本情報を追加（targetの情報は取得しない）
          if (e && typeof e === 'object' && 'type' in e) {
            errorInfo.errorType = (e as { type?: string }).type;
          }
          
          // エラーの原因を推測
          if (!image.url || image.url.length === 0) {
            errorInfo.reason = 'URL is empty';
          } else if (image.url.startsWith('/')) {
            errorInfo.reason = 'URL is relative path (should be absolute)';
          } else if (!image.url.startsWith('http://') && !image.url.startsWith('https://')) {
            errorInfo.reason = 'URL format is invalid';
          } else {
            errorInfo.reason = 'Image file may not exist or CORS/authentication issue';
          }
          
          logger.error('Image load error in PostureImageGrid', errorInfo, 'PostureImageGrid');
        }
        setImageError(true);
      }}
      onLoad={() => {
        // 成功ログは出力しない（大量のログを避ける）
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
      <div className="bg-white rounded-[2rem] shadow-sm border-2 border-gray-50 p-12 text-center">
        <p className="text-gray-500 text-lg">画像がありません</p>
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
            <span className={`${COLOR_CLASSES.PRIMARY_GREEN} text-white px-4 py-2 rounded-full whitespace-nowrap flex-shrink-0 shadow-sm`}>
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
                  className={`relative aspect-square rounded-[2rem] overflow-hidden cursor-pointer transition-all shadow-sm border-2 border-gray-50 bg-white ${
                    isSelected
                      ? `ring-4 ring-[#ED7D95]`
                      : ''
                  } ${!isSelectionMode ? 'cursor-default' : ''}`}
                >
                  <ImageDisplay image={image} />
                  {/* 下部オーバーレイ */}
                  <div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-80 rounded-b-[2rem] px-4 py-4 flex items-center justify-between">
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
