import React from 'react';

export interface EditableFieldProps<T = any> {
  label: string;
  value: string;
  isRequired?: boolean;
  isEditing: boolean;
  fieldName: keyof T;
  onEdit: (fieldName: keyof T) => void;
  onChange: (value: string) => void;
  onBlur: () => void;
  type?: 'text' | 'date' | 'select' | 'textarea' | 'tel';
  options?: { value: string; label: string }[];
  disabled?: boolean;
  icon?: React.ReactNode;
  isSaving?: boolean;
  showEmptyOption?: boolean; // 空のオプション（「選択してください」）を表示するかどうか
  inputMode?: 'text' | 'numeric' | 'tel' | 'email' | 'url' | 'search' | 'decimal'; // 入力モード（モバイルでキーボードタイプを制御）
  pattern?: string; // 入力パターン
}

export const EditableField = <T,>({
  label,
  value,
  isRequired = false,
  isEditing,
  fieldName,
  onEdit,
  onChange,
  onBlur,
  type = 'text',
  options = [],
  disabled = false,
  icon,
  isSaving = false,
  showEmptyOption = true, // デフォルトはtrue（後方互換性のため）
  inputMode,
  pattern,
}: EditableFieldProps<T>) => {
  const showValidationError = isRequired && !value && !isEditing;

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          {icon && <span className="text-[#68BE6B]">{icon}</span>}
          {label}
        </label>
      </div>

      {isEditing ? (
        <div className="relative">
          {type === 'select' ? (
            <select
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onBlur={onBlur}
              autoFocus
              disabled={isSaving}
              className={`w-full h-14 px-4 py-3 border-2 border-gray-50 rounded-2xl shadow-sm focus:outline-none focus:border-green-500 focus:ring-0 transition-all appearance-none bg-white bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 viewBox=%220 0 20 20%22%3E%3Cpath stroke=%22%236B7280%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22 stroke-width=%221.5%22 d=%22m6 8 4 4 4-4%22/%3E%3C/svg%3E')] bg-[length:1.5em_1.5em] bg-[right_0.75rem_center] bg-no-repeat pr-10 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
              style={{
                backgroundPosition: `calc(100% - ${value ? value.length * 0.6 : 6}ch) center`,
              }}
            >
              {showEmptyOption && <option value="">選択してください</option>}
              {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : type === 'textarea' ? (
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onBlur={onBlur}
              autoFocus
              disabled={isSaving}
              rows={4}
              className={`w-full h-auto min-h-[120px] px-4 py-3 border-2 border-gray-50 rounded-2xl shadow-sm focus:outline-none focus:border-green-500 focus:ring-0 transition-all resize-none ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
          ) : type === 'date' ? (
            <input
              type="date"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              onBlur={onBlur}
              autoFocus
              disabled={isSaving}
              max={new Date().toISOString().split('T')[0]} // 今日以前の日付のみ選択可能
              className={`w-full h-14 px-4 py-3 border-2 border-gray-50 rounded-2xl shadow-sm focus:outline-none focus:border-green-500 focus:ring-0 transition-all text-gray-700 font-medium ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
          ) : (
            <input
              type={type === 'tel' ? 'tel' : type}
              value={value}
              onChange={(e) => {
                // 数値のみ入力可能な場合（inputMode='numeric'またはtype='tel'）は、数値以外をフィルタリング
                if (inputMode === 'numeric' || type === 'tel') {
                  const numericValue = e.target.value.replace(/[^0-9]/g, '');
                  onChange(numericValue);
                } else {
                  onChange(e.target.value);
                }
              }}
              onBlur={onBlur}
              autoFocus
              disabled={isSaving}
              inputMode={inputMode}
              pattern={pattern}
              className={`w-full h-14 px-4 py-3 border-2 border-gray-50 rounded-2xl shadow-sm focus:outline-none focus:border-green-500 focus:ring-0 transition-all ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
          )}
          {isSaving && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-sm text-[#68BE6B]">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#68BE6B] border-t-transparent"></div>
              <span>保存中...</span>
            </div>
          )}
        </div>
      ) : (
        <div className="relative">
          <div className={`h-14 px-4 py-3 bg-gray-50 rounded-2xl shadow-sm border-2 border-gray-50 flex items-center ${disabled ? 'text-gray-500' : 'text-gray-900'} pr-16`}>
            {(() => {
              // selectタイプの場合は、valueに対応するlabelを表示
              if (type === 'select' && value) {
                const selectedOption = options.find(opt => opt.value === value);
                if (selectedOption) {
                  return selectedOption.label;
                }
              }
              // その他の場合はvalueをそのまま表示
              return value || (
                <span className="text-gray-400">
                  {showValidationError ? '必須項目を入力してください' : '未入力'}
                </span>
              );
            })()}
          </div>
          {!disabled && (
            <button
              onClick={() => onEdit(fieldName)}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-sm text-white bg-[#68BE6B] hover:bg-[#5aa85e] rounded-xl border border-[#68BE6B] transition-colors shadow-sm"
              aria-label={`${label}を編集`}
            >
              編集
            </button>
          )}
        </div>
      )}
      {showValidationError && (
        <p className="mt-1 text-sm text-red-500">必須項目を入力してください</p>
      )}
    </div>
  );
};
