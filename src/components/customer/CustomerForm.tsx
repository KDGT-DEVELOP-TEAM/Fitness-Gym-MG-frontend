// src/components/customers/CustomerForm.tsx
import React, { useState } from 'react';
import { Customer, CustomerFormData, CustomerStatusUpdate } from '../../types/customer';

interface CustomerFormProps {
  initialData?: Customer;
  onSubmit: (data: CustomerFormData, status: CustomerStatusUpdate) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  isSubmitting: boolean;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({ initialData, onSubmit, onDelete, isSubmitting }) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [formData, setFormData] = useState<CustomerFormData>({
    name: initialData?.name || '',
    kana: initialData?.kana || '',
    gender: initialData?.gender || '男',
    birthday: initialData?.birthday || '',
    height: initialData?.height || null,
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    address: initialData?.address || '',
    medical: initialData?.medical || '',
    taboo: initialData?.taboo || '',
    memo: initialData?.memo || '',
    firstPostureGroupId: initialData?.firstPostureGroupId || null,
  });

  const [status, setStatus] = useState<CustomerStatusUpdate>({
    isActive: initialData?.isActive ?? true
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStatus({ isActive: e.target.checked });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    try {
      await onSubmit(formData, status);
    } catch (err: any) {
      // APIからのエラーメッセージ（RuntimeException等）を解析して表示
      const message = err.response?.data?.message || err.message;
      
      if (message.includes("関連データが存在するため")) {
        setErrorMsg("この顧客にはレッスン履歴があるため削除できません。先にステータスを無効にしてください。");
      } else if (message.includes("有効顧客は削除できません")) {
        setErrorMsg("有効なステータスのままでは削除できません。");
      } else {
        setErrorMsg(message || "保存中にエラーが発生しました。");
      }
    }
  };

  const RequiredBadge = () => (
    <span className="ml-2 px-1 bg-red-500 text-white text-[10px] font-black rounded shadow-sm inline-block transform -translate-y-0.5">
      必須
    </span>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto px-2">
      {/* エラーメッセージ表示エリア */}
      {errorMsg && (
        <div className="p-4 bg-red-50 border-2 border-red-200 text-red-600 rounded-2xl font-bold text-sm animate-bounce">
          ⚠️ {errorMsg}
        </div>
      )}
      {/* 基本情報セクション */}
      <section className="space-y-4">
        <h3 className="text-lg font-medium border-b pb-2">基本情報</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">氏名 <RequiredBadge /></label>
            <input name="name" value={formData.name} onChange={handleChange} required className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium">ふりがな <RequiredBadge /></label>
            <input name="kana" value={formData.kana || ''} onChange={handleChange} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium">誕生日 <RequiredBadge /></label>
            <input type="date" name="birthday" value={formData.birthday} onChange={handleChange} required className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium">性別 <RequiredBadge /></label>
            <select name="gender" value={formData.gender} onChange={handleChange} className="w-full border p-2 rounded">
              <option value="男">男</option>
              <option value="女">女</option>
            </select>
          </div>
        </div>
      </section>

      {/* 連絡先セクション */}
      <section className="space-y-4">
        <h3 className="text-lg font-medium border-b pb-2">連絡先・詳細</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium">住所 <RequiredBadge /></label>
            <input type="text" name="address" value={formData.address || ''} onChange={handleChange} required className="w-full border p-2 rounded" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium">メールアドレス <RequiredBadge /></label>
            <input type="email" name="email" value={formData.email || ''} onChange={handleChange} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium">電話番号 <RequiredBadge /></label>
            <input type="tel" name="phone" value={formData.phone || ''} onChange={handleChange} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium">身長 (cm) <RequiredBadge /></label>
            <input type="number" step="0.1" name="height" value={formData.height || ''} onChange={handleChange} className="w-full border p-2 rounded" />
          </div>
        </div>
      </section>

      {/* 健康情報セクション */}
      <section className="space-y-4">
        <h3 className="text-lg font-medium border-b pb-2">健康情報・禁忌等</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-red-600 font-bold">禁忌事項 (Taboo)</label>
            <textarea name="taboo" value={formData.taboo || ''} onChange={handleChange} rows={2} className="w-full border p-2 rounded border-red-200 bg-red-50" />
          </div>
          <div>
            <label className="block text-sm font-medium">既往歴 (Medical History)</label>
            <textarea name="medical" value={formData.medical || ''} onChange={handleChange} rows={2} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium">自由記入メモ (Memo)</label>
            <textarea name="memo" value={formData.memo || ''} onChange={handleChange} rows={3} className="w-full border p-2 rounded" />
          </div>
        </div>

        <div className="flex items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
          <input type="checkbox" id="isActive" name="isActive" checked={status.isActive} onChange={handleStatusChange} className="w-5 h-5 text-green-600 rounded" />
          <label htmlFor="isActive" className="ml-3 text-sm font-bold text-gray-700">顧客ステータスを<span className={status.isActive ? "text-green-600" : "text-gray-400"}>{status.isActive ? "有効" : "無効"}</span>にする</label>
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