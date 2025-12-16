import React, { useState } from 'react';
import { LessonFormData } from '../../types/lesson';

interface LessonFormProps {
  initialData?: Partial<LessonFormData>;
  onSubmit: (data: LessonFormData) => Promise<void>;
  onCancel?: () => void;
}

export const LessonForm: React.FC<LessonFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<LessonFormData>({
    storeId: initialData?.storeId || '',
    userId: initialData?.userId || '',
    customerId: initialData?.customerId || '',
    postureGroupId: initialData?.postureGroupId || null,
    condition: initialData?.condition || '',
    weight: initialData?.weight || null,
    meal: initialData?.meal || '',
    memo: initialData?.memo || '',
    startDate: initialData?.startDate || '',
    endDate: initialData?.endDate || '',
    nextDate: initialData?.nextDate || null,
    nextStoreId: initialData?.nextStoreId || null,
    nextUserId: initialData?.nextUserId || null,
    trainings: initialData?.trainings || [],
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div>
        <label className="block text-sm font-medium">顧客ID</label>
        <input
          type="text"
          value={formData.customerId}
          onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
          required
          className="mt-1 block w-full px-3 py-2 border rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">店舗ID</label>
        <input
          type="text"
          value={formData.storeId}
          onChange={(e) => setFormData({ ...formData, storeId: e.target.value })}
          required
          className="mt-1 block w-full px-3 py-2 border rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">ユーザーID</label>
        <input
          type="text"
          value={formData.userId}
          onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
          required
          className="mt-1 block w-full px-3 py-2 border rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">開始日</label>
        <input
          type="date"
          value={formData.startDate || ''}
          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
          className="mt-1 block w-full px-3 py-2 border rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">終了日</label>
        <input
          type="date"
          value={formData.endDate || ''}
          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
          className="mt-1 block w-full px-3 py-2 border rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">体重 (kg)</label>
        <input
          type="number"
          step="0.1"
          value={formData.weight || ''}
          onChange={(e) => setFormData({ ...formData, weight: e.target.value ? Number(e.target.value) : null })}
          className="mt-1 block w-full px-3 py-2 border rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">メモ</label>
        <textarea
          value={formData.memo || ''}
          onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
          className="mt-1 block w-full px-3 py-2 border rounded-md"
        />
      </div>
      <div className="flex space-x-2">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {loading ? '保存中...' : '保存'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            キャンセル
          </button>
        )}
      </div>
    </form>
  );
};
