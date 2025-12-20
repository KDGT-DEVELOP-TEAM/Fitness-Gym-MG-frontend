// src/components/customers/CustomerForm.tsx
import React, { useState } from 'react';
import { Customer, CustomerFormData } from '../../types/customer';

interface CustomerFormProps {
  initialData?: Customer;
  onSubmit: (data: CustomerFormData) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  isSubmitting: boolean;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({ initialData, onSubmit, onDelete, isSubmitting }) => {
  const [formData, setFormData] = useState<CustomerFormData>({
    name: initialData?.name || '',
    kana: initialData?.kana || '',
    gender: initialData?.gender || 'male',
    birthday: initialData?.birthday || '',
    height: initialData?.height || null,
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    address: initialData?.address || '',
    medical: initialData?.medical || '',
    taboo: initialData?.taboo || '',
    memo: initialData?.memo || '',
    isActive: initialData?.isActive ?? true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto px-2">
      {/* 基本情報セクション */}
      <section className="space-y-4">
        <h3 className="text-lg font-medium border-b pb-2">基本情報</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">氏名 *</label>
            <input name="name" value={formData.name} onChange={handleChange} required className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium">ふりがな</label>
            <input name="kana" value={formData.kana || ''} onChange={handleChange} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium">誕生日 *</label>
            <input type="date" name="birthday" value={formData.birthday} onChange={handleChange} required className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium">性別</label>
            <select name="gender" value={formData.gender} onChange={handleChange} className="w-full border p-2 rounded">
              <option value="male">男性</option>
              <option value="female">女性</option>
              <option value="other">その他</option>
              <option value="unknown">未回答</option>
            </select>
          </div>
        </div>
      </section>

      {/* 連絡先セクション */}
      <section className="space-y-4">
        <h3 className="text-lg font-medium border-b pb-2">連絡先・詳細</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium">メールアドレス</label>
            <input type="email" name="email" value={formData.email || ''} onChange={handleChange} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium">電話番号</label>
            <input type="tel" name="phone" value={formData.phone || ''} onChange={handleChange} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium">身長 (cm)</label>
            <input type="number" step="0.1" name="height" value={formData.height || ''} onChange={handleChange} className="w-full border p-2 rounded" />
          </div>
        </div>
      </section>

      {/* 健康情報セクション */}
      <section className="space-y-4">
        <h3 className="text-lg font-medium border-b pb-2 text-red-600">健康情報・禁忌</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium">既往歴 (Medical History)</label>
            <textarea name="medical" value={formData.medical || ''} onChange={handleChange} rows={2} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium text-red-600 font-bold">禁忌事項 (Taboo)</label>
            <textarea name="taboo" value={formData.taboo || ''} onChange={handleChange} rows={2} className="w-full border p-2 rounded border-red-200 bg-red-50" />
          </div>
        </div>

        <div className="flex items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
          <input type="checkbox" id="isActive" name="isActive" checked={formData.isActive} onChange={(e) => setFormData(prev => ({...prev, isActive: e.target.checked}))} className="w-5 h-5 text-green-600 rounded" />
          <label htmlFor="isActive" className="ml-3 text-sm font-bold text-gray-700">顧客ステータスを「有効」にする</label>
        </div>
      </section>

      <div className="pt-4 space-y-3">
        <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-700 shadow-lg transition-all active:scale-[0.98] disabled:opacity-50">
          {isSubmitting ? '保存中...' : initialData ? '情報を更新する' : '新規登録する'}
        </button>

        {initialData && onDelete && (
          <button type="button" onClick={() => onDelete(initialData.id)} disabled={isSubmitting} className="w-full py-3 text-red-500 font-bold hover:bg-red-50 rounded-2xl transition-all">
            この顧客データを削除する
          </button>
        )}
      </div>
    </form>
  );
};