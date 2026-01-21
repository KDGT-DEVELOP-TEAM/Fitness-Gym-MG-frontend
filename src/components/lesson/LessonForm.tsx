import React, { useState } from 'react';
import { LessonFormData } from '../../types/lesson';
import { useOptions } from '../../hooks/useOptions';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import { getCurrentLocalDateTime } from '../../utils/validators';

interface LessonFormProps {
  initialData?: Partial<LessonFormData>;
  onSubmit: (data: LessonFormData) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export const LessonForm: React.FC<LessonFormProps> = ({
  initialData, onSubmit, onCancel, isSubmitting = false
}) => {
  const { stores, users, customers } = useOptions();
  const { handleError } = useErrorHandler();
  const defaultFormData: LessonFormData = {
    storeId: '',
    userId: '',
    customerId: '',
    condition: '',
    weight: null,
    meal: '',
    memo: '',
    startDate: '',
    endDate: '',
    nextDate: '',
    nextStoreId: '',
    nextUserId: '',
    trainings: [],
  };
  const [formData, setFormData] = useState<LessonFormData>(
    initialData ? { ...defaultFormData, ...initialData } : defaultFormData
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (err) {
      setError(handleError(err, 'LessonForm'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      {error && <div className="text-red-600 text-sm">{error}</div>}
      
      <div>
        <label className="block text-sm font-medium">顧客</label>
        <select
          value={formData.customerId}
          onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
          required
          className="mt-1 block w-full px-3 py-2 border rounded-md"
        >
          <option value="">選択してください</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium">担当</label>
        <select
          value={formData.userId}
          onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
          required
          className="mt-1 block w-full px-3 py-2 border rounded-md"
        >
          <option value="">選択してください</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium">店舗</label>
        <select
          value={formData.storeId}
          onChange={(e) => setFormData({ ...formData, storeId: e.target.value })}
          required
          className="mt-1 block w-full px-3 py-2 border rounded-md"
        >
          <option value="">選択してください</option>
          {stores.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium">開始日時</label>
        <input
          type="datetime-local"
          value={formData.startDate ?? ''}
          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
          max={getCurrentLocalDateTime()}
          required
          className="mt-1 block w-full px-3 py-2 border rounded-md"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium">終了日時</label>
        <input
          type="datetime-local"
          value={formData.endDate ?? ''}
          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
          max={getCurrentLocalDateTime()}
          required
          className="mt-1 block w-full px-3 py-2 border rounded-md"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium">体重 (kg)</label>
        <input
          type="number"
          step="0.1"
          value={formData.weight ?? ''}
          onChange={(e) => setFormData({ ...formData, weight: e.target.value ? Number(e.target.value) : null })}
          className="mt-1 block w-full px-3 py-2 border rounded-md"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium">体調</label>
        <input
          type="text"
          value={formData.condition ?? ''}
          onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
          placeholder="体調メモ"
          className="mt-1 block w-full px-3 py-2 border rounded-md"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium">食事</label>
        <input
          type="text"
          value={formData.meal ?? ''}
          onChange={(e) => setFormData({ ...formData, meal: e.target.value })}
          placeholder="食事内容"
          className="mt-1 block w-full px-3 py-2 border rounded-md"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium">メモ</label>
        <textarea
          value={formData.memo ?? ''}
          onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
          className="mt-1 block w-full px-3 py-2 border rounded-md"
          rows={3}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium">次回予約日時</label>
        <input
          type="datetime-local"
          value={formData.nextDate ?? ''}
          onChange={(e) => setFormData({ ...formData, nextDate: e.target.value })}
          className="mt-1 block w-full px-3 py-2 border rounded-md"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium">次回店舗</label>
        <select
          value={formData.nextStoreId ?? ''}
          onChange={(e) => setFormData({ ...formData, nextStoreId: e.target.value })}
          className="mt-1 block w-full px-3 py-2 border rounded-md"
        >
          <option value="">未定</option>
          {stores.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium">次回トレーナー</label>
        <select
          value={formData.nextUserId ?? ''}
          onChange={(e) => setFormData({ ...formData, nextUserId: e.target.value })}
          className="mt-1 block w-full px-3 py-2 border rounded-md"
        >
          <option value="">未定</option>
          {users
            .filter((u) => {
              // 管理者（ADMIN）を除外し、店長（MANAGER）とトレーナー（TRAINER）のみ選択可能
              return !u.role || (u.role !== 'ADMIN');
            })
            .map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
        </select>
      </div>
      
      <div className="flex space-x-2">
        <button
          type="submit"
          disabled={loading || isSubmitting}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading || isSubmitting ? '保存中...' : '保存'}
        </button>
        {onCancel && (
          <button 
            type="button" 
            onClick={onCancel} 
            className="w-full py-3 text-gray-400 text-[10px] font-black hover:text-gray-600 transition-all uppercase tracking-widest"
          >
            キャンセル
          </button>
        )}
      </div>
    </form>
  );
};
