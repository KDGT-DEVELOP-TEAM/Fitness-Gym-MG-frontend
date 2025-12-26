import React, { useState } from 'react';
import { lessonApi } from '../api/lessonApi';
import { LessonFormData } from '../types/lesson';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

export const LessonForm: React.FC = () => {
  const [formData, setFormData] = useState<LessonFormData>({
    storeId: '',
    userId: '',
    customerId: '',
    postureGroupId: null,
    condition: '',
    weight: null,
    meal: '',
    memo: '',
    startDate: '',
    endDate: '',
    nextDate: null,
    nextStoreId: null,
    nextUserId: null,
    trainings: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await lessonApi.create(formData);
      setSuccessMessage('レッスンを登録しました');

      // 2秒後に顧客選択画面に遷移
      setTimeout(() => {
        navigate(ROUTES.CUSTOMER_SELECT);
      }, 2000);
    } catch (error) {
      console.error('Error creating lesson:', error);
      setError('レッスンの登録に失敗しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">レッスン登録</h1>

      {/* エラーメッセージ */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      )}

      {/* 成功メッセージ */}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-600">
          {successMessage}
        </div>
      )}

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
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {loading ? '登録中...' : '登録'}
        </button>
      </form>
    </div>
  );
};
