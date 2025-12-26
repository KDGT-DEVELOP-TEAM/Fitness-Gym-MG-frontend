import React, { useState } from 'react';
import { LessonFormData } from '../../types/lesson';

interface LessonFormProps {
  initialData?: LessonFormData;
  onSubmit: (data: LessonFormData) => Promise<void>;
  onCancel?: () => void;
}

export const LessonForm: React.FC<LessonFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<LessonFormData>(
    initialData || {
      customerId: '',
      trainerId: '',
      date: '',
      startTime: '',
      endTime: '',
      notes: '',
    }
  );
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
        <label className="block text-sm font-medium">インストラクターID</label>
        <input
          type="text"
          value={formData.trainerId}
          onChange={(e) => setFormData({ ...formData, trainerId: e.target.value })}
          required
          className="mt-1 block w-full px-3 py-2 border rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">日付</label>
        <input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          required
          className="mt-1 block w-full px-3 py-2 border rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">開始時間</label>
        <input
          type="time"
          value={formData.startTime}
          onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
          required
          className="mt-1 block w-full px-3 py-2 border rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">終了時間</label>
        <input
          type="time"
          value={formData.endTime}
          onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
          required
          className="mt-1 block w-full px-3 py-2 border rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">備考</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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

