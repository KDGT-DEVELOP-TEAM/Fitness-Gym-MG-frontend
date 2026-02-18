import React from 'react';
import { COLOR_CLASSES } from '../../constants/colors';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

/**
 * Reusable confirmation modal component
 * Replaces window.confirm for better UX and styling
 */
export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = '確認',
  cancelText = 'キャンセル',
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onCancel}
    >
      <div
        className={`${COLOR_CLASSES.BACKGROUND_LIGHT} border border-[#DFDFDF] rounded-2xl p-8 max-w-md w-full mx-4 font-poppins`}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-2xl font-medium text-gray-800 mb-4">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex gap-4 justify-end">
          <button
            onClick={onCancel}
            type="button"
            disabled={isLoading}
            className="px-6 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            type="button"
            disabled={isLoading}
            className="px-6 py-2 rounded-lg bg-[#FDB7B7] text-white hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '処理中...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
