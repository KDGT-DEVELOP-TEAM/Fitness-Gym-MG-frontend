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
  type?: 'text' | 'date' | 'select' | 'textarea';
  options?: { value: string; label: string }[];
  disabled?: boolean;
  icon?: React.ReactNode;
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
        <>
          {type === 'select' ? (
            <select
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onBlur={onBlur}
              autoFocus
              className="w-full px-3 py-2 border border-[#68BE6B] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#68BE6B] focus:border-transparent appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 viewBox=%220 0 20 20%22%3E%3Cpath stroke=%22%236B7280%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22 stroke-width=%221.5%22 d=%22m6 8 4 4 4-4%22/%3E%3C/svg%3E')] bg-[length:1.5em_1.5em] bg-[right_0.5rem_center] bg-no-repeat pr-10"
              style={{
                backgroundPosition: `calc(100% - ${value ? value.length * 0.6 : 6}ch) center`,
              }}
            >
              <option value="">選択してください</option>
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
              rows={4}
              className="w-full px-3 py-2 border border-[#68BE6B] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#68BE6B] focus:border-transparent resize-none"
            />
          ) : type === 'date' ? (
            <div
              className="flex items-center gap-2"
              onBlur={(e) => {
                // フォーカスが日付入力グループの外に移動した場合のみ保存
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  onBlur();
                }
              }}
            >
              <input
                type="text"
                value={value.split('-')[0] || ''}
                onChange={(e) => {
                  const year = e.target.value;
                  const parts = value.split('-');
                  onChange(`${year}-${parts[1] || '01'}-${parts[2] || '01'}`);
                }}
                autoFocus
                placeholder="年"
                maxLength={4}
                className="w-20 px-3 py-2 border border-[#68BE6B] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#68BE6B] focus:border-transparent text-center"
              />
              <span className="text-gray-700">年</span>
              <input
                type="text"
                value={value.split('-')[1] || ''}
                onChange={(e) => {
                  const month = e.target.value;
                  const parts = value.split('-');
                  onChange(`${parts[0] || '2000'}-${month}-${parts[2] || '01'}`);
                }}
                placeholder="月"
                maxLength={2}
                className="w-16 px-3 py-2 border border-[#68BE6B] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#68BE6B] focus:border-transparent text-center"
              />
              <span className="text-gray-700">月</span>
              <input
                type="text"
                value={value.split('-')[2] || ''}
                onChange={(e) => {
                  const day = e.target.value;
                  const parts = value.split('-');
                  onChange(`${parts[0] || '2000'}-${parts[1] || '01'}-${day}`);
                }}
                placeholder="日"
                maxLength={2}
                className="w-16 px-3 py-2 border border-[#68BE6B] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#68BE6B] focus:border-transparent text-center"
              />
              <span className="text-gray-700">日</span>
            </div>
          ) : (
            <input
              type={type}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onBlur={onBlur}
              autoFocus
              className="w-full px-3 py-2 border border-[#68BE6B] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#68BE6B] focus:border-transparent"
            />
          )}
        </>
      ) : (
        <div className="relative">
          <div className={`px-3 py-2 bg-gray-50 rounded-lg ${disabled ? 'text-gray-500' : 'text-gray-900'} pr-16`}>
            {value || (
              <span className="text-gray-400">
                {showValidationError ? '必須項目を入力してください' : '未入力'}
              </span>
            )}
          </div>
          {!disabled && (
            <button
              onClick={() => onEdit(fieldName)}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-sm text-white bg-[#68BE6B] hover:bg-[#5aa85e] rounded border border-[#68BE6B] transition-colors"
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
