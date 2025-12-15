import React from 'react';
import { COLOR_CLASSES } from '../../constants/colors';

interface PostureImageListFloatingButtonsProps {
  isSelectionMode: boolean;
  selectedCount: number;
  onEnterSelectionMode: () => void;
  onCompare: () => void;
  onDelete: () => void;
  onExitSelectionMode: () => void;
}

/**
 * Floating action buttons for posture image list
 */
export const PostureImageListFloatingButtons: React.FC<PostureImageListFloatingButtonsProps> = ({
  isSelectionMode,
  selectedCount,
  onEnterSelectionMode,
  onCompare,
  onDelete,
  onExitSelectionMode,
}) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {!isSelectionMode ? (
        <button
          onClick={onEnterSelectionMode}
          type="button"
          className={`min-w-[140px] px-6 py-3 text-lg ${COLOR_CLASSES.PRIMARY_PINK} text-black rounded-lg shadow-lg ${COLOR_CLASSES.PRIMARY_PINK_HOVER} transition-colors`}
        >
          選択
        </button>
      ) : (
        <>
          <div className="flex gap-3 w-[292px] justify-end">
            <button
              onClick={onCompare}
              disabled={selectedCount !== 2}
              type="button"
              className={`w-[140px] px-6 py-3 text-lg rounded-lg shadow-lg transition-colors ${COLOR_CLASSES.PRIMARY_GREEN} text-white ${COLOR_CLASSES.PRIMARY_GREEN_HOVER} disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed`}
            >
              比較
            </button>
          </div>
          <div className="flex gap-3 w-[292px]">
            <button
              onClick={onDelete}
              disabled={selectedCount === 0}
              type="button"
              className={`flex-1 px-6 py-3 text-lg rounded-lg shadow-lg transition-colors ${
                selectedCount > 0
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              削除
            </button>
            <button
              onClick={onExitSelectionMode}
              type="button"
              className="flex-1 px-6 py-3 text-lg bg-gray-500 text-white rounded-lg shadow-lg hover:bg-gray-600 transition-colors"
            >
              キャンセル
            </button>
          </div>
        </>
      )}
    </div>
  );
};
