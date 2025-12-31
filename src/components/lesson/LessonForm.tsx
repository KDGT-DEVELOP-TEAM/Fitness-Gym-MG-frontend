import React, { useState } from 'react';
import axios from 'axios';
import { LessonFormData } from '../../types/lesson';
import { UserListItem } from '../../types/api/user';
import { CustomerListItem } from '../../types/api/customer';

interface LessonFormProps {
  initialData?: LessonFormData;
  onSubmit: (data: LessonFormData) => Promise<void>;
  trainers: UserListItem[];
  customers: CustomerListItem[];
  stores: string[];
  onCancel?: () => void;
}

interface ApiErrorResponse {
  message: string;
}

export const LessonForm: React.FC<LessonFormProps> = ({
  initialData,
  trainers,
  customers,
  stores,
  onSubmit,
  onCancel,
}) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 1. 初期状態の設定
  const [formData, setFormData] = useState<LessonFormData>(
    initialData || {
      customerName: '',
      trainerName: '',
      storeName: '',
      startDate: '',
      endDate: '',
      condition: null,
      weight: null,
      bmi: null,
      meal: null,
      memo: null,
      nextDate: null,
      nextStoreName: null,
      nextTrainerName: null,
    }
  );

  // 2. 汎用的な入力ハンドラー (型安全)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    let finalValue: string | number | null = value;
    if (type === 'number') {
      finalValue = value === '' ? null : parseFloat(value);
    } else if (value === '') {
      finalValue = null;
    }

    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      await onSubmit(formData);
    } catch (err: unknown) {
      let message = "保存中にエラーが発生しました。";
      if (axios.isAxiosError<ApiErrorResponse>(err)) {
        message = err.response?.data?.message || err.message;
      }
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  const RequiredBadge = () => (
    <span className="ml-2 px-1 bg-red-500 text-white text-[10px] font-black rounded shadow-sm">必須</span>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-h-[75vh] overflow-y-auto px-2 custom-scrollbar">
      {errorMsg && (
        <div className="p-4 bg-red-50 border-2 border-red-100 text-red-600 rounded-2xl font-bold text-sm">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* セクション1: 基本スケジュール */}
      <section className="space-y-4">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b pb-2">Lesson Schedule</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-1">実施店舗 <RequiredBadge /></label>
            <select 
              name="storeName" 
              value={formData.storeName} 
              onChange={handleChange} 
              required 
              className="w-full h-12 border-2 border-gray-50 rounded-xl px-4 focus:border-green-500 outline-none transition-all appearance-none bg-white"
            >
              <option value="">店舗を選択</option>
              {stores.map(name => <option key={name} value={name}>{name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">開始日時 <RequiredBadge /></label>
            <input type="datetime-local" name="startDate" value={formData.startDate} onChange={handleChange} required className="w-full h-12 border-2 border-gray-50 rounded-xl px-4 focus:border-green-500 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">終了日時 <RequiredBadge /></label>
            <input type="datetime-local" name="endDate" value={formData.endDate} onChange={handleChange} required className="w-full h-12 border-2 border-gray-50 rounded-xl px-4 focus:border-green-500 outline-none transition-all" />
          </div>
        </div>
      </section>

      {/* セクション2: 担当者・顧客 */}
      <section className="space-y-4">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b pb-2">Assignment</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">顧客名 <RequiredBadge /></label>
            <select 
              name="customerName" 
              value={formData.customerName} 
              onChange={handleChange} 
              required 
              className="w-full h-12 border-2 border-gray-50 rounded-xl px-4 focus:border-green-500 outline-none transition-all bg-white"
            >
              <option value="">顧客を選択</option>
              {customers.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">担当トレーナー <RequiredBadge /></label>
            <select 
              name="trainerName" 
              value={formData.trainerName} 
              onChange={handleChange} 
              required 
              className="w-full h-12 border-2 border-gray-50 rounded-xl px-4 focus:border-green-500 outline-none transition-all bg-white"
            >
              <option value="">トレーナーを選択</option>
              {trainers.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
            </select>
          </div>
        </div>
      </section>

      {/* セクション3: 体組成・カルテ */}
      <section className="space-y-4 p-5 bg-gray-50 rounded-[2rem] border-2 border-gray-100">
        <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
          Body Composition & Condition
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-black text-gray-400 uppercase mb-1">体重 (kg)</label>
            <input type="number" step="0.1" name="weight" value={formData.weight || ''} onChange={handleChange} className="w-full h-12 border-2 border-white rounded-xl px-4 focus:border-green-500 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-[11px] font-black text-gray-400 uppercase mb-1">BMI</label>
            <input type="number" step="0.1" name="bmi" value={formData.bmi || ''} onChange={handleChange} className="w-full h-12 border-2 border-white rounded-xl px-4 focus:border-green-500 outline-none transition-all" />
          </div>
          <div className="col-span-2 md:col-span-1">
            <label className="block text-[11px] font-black text-gray-400 uppercase mb-1">体調 (Condition)</label>
            <input name="condition" value={formData.condition || ''} onChange={handleChange} className="w-full h-12 border-2 border-white rounded-xl px-4 focus:border-green-500 outline-none transition-all" placeholder="良好、疲労気味など" />
          </div>
        </div>
      </section>

      {/* セクション4: レッスン内容・次回予約 */}
      <section className="space-y-4">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b pb-2">Training Logs</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">食事指導・内容 (Meal)</label>
            <textarea name="meal" value={formData.meal || ''} onChange={handleChange} rows={2} className="w-full border-2 border-gray-50 rounded-xl p-4 focus:border-green-500 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">レッスンメモ (Memo)</label>
            <textarea name="memo" value={formData.memo || ''} onChange={handleChange} rows={3} className="w-full border-2 border-gray-50 rounded-xl p-4 focus:border-green-500 outline-none transition-all" />
          </div>
        </div>
      </section>

      {/* 送信ボタンエリア */}
      <div className="pt-4 flex flex-col gap-3">
        <button type="submit" disabled={loading} className="w-full py-4 bg-green-600 text-white font-black rounded-2xl hover:bg-green-700 shadow-xl shadow-green-100 transition-all active:scale-95 disabled:opacity-50">
          {loading ? '保存中...' : 'レッスン記録を保存する'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="w-full py-3 text-gray-400 text-[10px] font-black hover:text-gray-600 transition-all uppercase tracking-widest">
            キャンセル
          </button>
        )}
      </div>
    </form>
  );
};