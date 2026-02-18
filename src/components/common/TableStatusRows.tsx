import React from 'react';

interface StatusRowProps {
  colSpan: number;
  message?: string;
}

interface LoadingSpinnerProps {
  message?: string;
  className?: string;
  minHeight?: string;
}

// 汎用的なローディングスピナーコンポーネント（ページ全体で使用可能）
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = "Loading Data...", 
  className = "",
  minHeight = "min-h-[400px]"
}) => (
  <div className={`flex items-center justify-center ${minHeight} ${className}`}>
    <div className="text-center">
      <div className="animate-spin h-10 w-10 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-4"></div>
      <p className="text-gray-400 font-black uppercase tracking-widest text-xs">{message}</p>
    </div>
  </div>
);

// ロード中の表示（テーブル行用）
export const LoadingRow: React.FC<StatusRowProps> = ({ colSpan, message = "Loading Data..." }) => (
  <tr>
    <td colSpan={colSpan} className="py-24 text-center">
      <div className="animate-spin h-10 w-10 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-4"></div>
      <p className="text-gray-400 font-black uppercase tracking-widest text-xs">{message}</p>
    </td>
  </tr>
);

// データが空の時の表示
export const EmptyRow: React.FC<StatusRowProps> = ({ colSpan, message = "データが見つかりませんでした" }) => (
  <tr>
    <td colSpan={colSpan} className="py-24 text-center">
      <div className="mb-4 flex justify-center text-gray-200">
        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <p className="text-gray-400 font-bold">{message}</p>
    </td>
  </tr>
);