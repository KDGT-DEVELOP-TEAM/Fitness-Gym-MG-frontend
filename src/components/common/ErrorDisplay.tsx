import React from 'react';

interface ErrorDisplayProps {
  error: string | null;
  onRetry?: () => void;
  variant?: 'error' | 'info';
}

/**
 * 共通のエラー表示コンポーネント
 * 全ページで統一されたエラー表示を提供します
 * 
 * @param error - エラーメッセージ（nullの場合は何も表示しない）
 * @param onRetry - 再試行ボタンがクリックされたときのコールバック（オプション）
 * @param variant - 表示バリアント（'error': エラー表示, 'info': 情報表示）
 */
export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ 
  error, 
  onRetry, 
  variant = 'error' 
}) => {
  if (!error) return null;
  
  // 「顧客は退会済みです」の場合は情報表示として扱う
  const isCustomerDeleted = error === '顧客は退会済みです';
  const displayVariant = isCustomerDeleted ? 'info' : variant;
  
  if (displayVariant === 'info') {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
        <div className="bg-blue-50 border-2 border-blue-100 rounded-2xl p-6 text-center">
          <div className="text-blue-600 text-lg font-bold mb-2">{error}</div>
          {isCustomerDeleted && (
            <p className="text-blue-700 mb-4">この顧客は退会済みのため、履歴を表示できません。</p>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-red-50 border-2 border-red-100 rounded-2xl p-6 text-center">
        <div className="text-red-600 text-lg font-bold mb-2">エラーが発生しました</div>
        <p className="text-red-700 mb-4">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-6 py-2 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition-colors shadow-sm"
          >
            再読み込み
          </button>
        )}
      </div>
    </div>
  );
};
