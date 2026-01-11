import React, { useState } from 'react';
import axios from 'axios';
import { Customer, CustomerRequest } from '../../types/api/customer';
import { CustomerFormData } from '../../types/form/customer';
import { validatePastDate } from '../../utils/validators';
import { getAllErrorMessages } from '../../utils/errorMessages';
import { isErrorResponse } from '../../types/api/error';

interface CustomerFormProps {
  initialData?: Customer;
  onSubmit: (data: CustomerRequest) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  isSubmitting: boolean;
}

interface ApiErrorResponse {
  message: string;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({ initialData, onSubmit, onDelete, isSubmitting }) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  
  const [formData, setFormData] = useState<CustomerFormData & { active: boolean }>({
    name: initialData?.name || '',
    kana: initialData?.kana || '',
    gender: initialData?.gender || 'MALE', // バックエンドのGender Enum（MALE/FEMALE）に対応
    birthday: initialData?.birthdate || '', // バックエンドのCustomerResponse.birthdateをフォームのbirthdayに変換
    height: initialData?.height || 0,
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    address: initialData?.address || '',
    medical: initialData?.medical || '',
    taboo: initialData?.taboo || '',
    memo: initialData?.memo || '',
    active: initialData?.active ?? true, // フォーム内で管理（バックエンドのCustomer.activeに対応）
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let finalValue: any = value;

    if (type === 'checkbox') {
      finalValue = (e.target as HTMLInputElement).checked;
    } else if (name === 'height') {
      finalValue = value === '' ? 0 : parseFloat(value);
    }

    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // 過去日付チェック
    if (formData.birthday && !validatePastDate(formData.birthday)) {
      setErrorMsg('生年月日は過去の日付である必要があります');
      return;
    }

    try {
      // フォーム用データを API リクエスト用に整形
      const requestData: CustomerRequest = {
        name: formData.name,
        kana: formData.kana,
        gender: formData.gender,
        birthday: formData.birthday,
        height: formData.height,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        medical: formData.medical || undefined,
        taboo: formData.taboo || undefined,
        memo: formData.memo || undefined,
        active: formData.active, // バックエンドのCustomerRequestは`active`フィールドを使用
      };

      await onSubmit(requestData);
    } catch (err: unknown) {
      // 複数エラーメッセージを取得
      const allErrors = getAllErrorMessages(err);
      if (allErrors.length > 0) {
        setErrorMessages(allErrors);
        // 最初のエラーメッセージを単一エラーとしても設定（後方互換性）
        setErrorMsg(allErrors[0]);
      } else {
        // エラーメッセージを取得
        let message = "保存中にエラーが発生しました。";
        if (axios.isAxiosError(err)) {
          if (err.response?.data && isErrorResponse(err.response.data)) {
            message = err.response.data.message || err.message;
          } else {
            message = (err.response?.data as { message?: string })?.message || err.message;
          }
        }
        setErrorMsg(message);
        setErrorMessages([]);
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
      {(errorMsg || errorMessages.length > 0) && (
        <div className="p-4 bg-red-50 border-2 border-red-200 text-red-600 rounded-2xl text-sm">
          {errorMessages.length > 1 ? (
            // 複数エラーの場合
            <div>
              <div className="font-bold mb-2">⚠️ 以下のエラーが発生しました:</div>
              <ul className="list-disc list-inside space-y-1">
                {errorMessages.map((msg, index) => (
                  <li key={index}>{msg}</li>
                ))}
              </ul>
            </div>
          ) : (
            // 単一エラーの場合
            <div className="font-bold">⚠️ {errorMsg}</div>
          )}
        </div>
      )}
      {/* 基本情報セクション */}
      <section className="space-y-4">
        <h3 className="text-lg font-medium border-b pb-2">基本情報</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">氏名 <RequiredBadge /></label>
            <input name="name" value={formData.name} onChange={handleChange} required maxLength={100} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium">ふりがな <RequiredBadge /></label>
            <input name="kana" value={formData.kana || ''} onChange={handleChange} required maxLength={100} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium">誕生日 <RequiredBadge /></label>
            <input type="date" name="birthday" value={formData.birthday} onChange={handleChange} required className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium">性別 <RequiredBadge /></label>
            <select name="gender" value={formData.gender} onChange={handleChange} className="w-full border p-2 rounded">
              <option value="MALE">男</option>
              <option value="FEMALE">女</option>
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
            <input type="text" name="address" value={formData.address || ''} onChange={handleChange} required maxLength={200} className="w-full border p-2 rounded" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium">メールアドレス <RequiredBadge /></label>
            <input type="email" name="email" value={formData.email || ''} onChange={handleChange} required maxLength={255} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium">電話番号 <RequiredBadge /></label>
            <input type="tel" name="phone" value={formData.phone || ''} onChange={handleChange} required maxLength={12} pattern="^[0-9\-]+$" className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium">身長 (cm) <RequiredBadge /></label>
            <input type="number" step="0.1" name="height" value={formData.height || ''} onChange={handleChange} required min="50" max="300" className="w-full border p-2 rounded" />
          </div>
        </div>
      </section>

      {/* 健康情報セクション */}
      <section className="space-y-4">
        <h3 className="text-lg font-medium border-b pb-2">健康情報・禁忌等</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-red-600 font-bold">禁忌事項 (Taboo)</label>
            <textarea name="taboo" value={formData.taboo || ''} onChange={handleChange} rows={2} maxLength={100} className="w-full border p-2 rounded border-red-200 bg-red-50" />
          </div>
          <div>
            <label className="block text-sm font-medium">既往歴 (Medical History)</label>
            <textarea name="medical" value={formData.medical || ''} onChange={handleChange} rows={2} maxLength={100} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium">自由記入メモ (Memo)</label>
            <textarea name="memo" value={formData.memo || ''} onChange={handleChange} rows={3} maxLength={500} className="w-full border p-2 rounded" />
          </div>
        </div>

        <div className="flex items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
          <input type="checkbox" id="active" name="active" checked={formData.active} onChange={handleChange} className="w-5 h-5 text-green-600 rounded" />
          <label htmlFor="active" className="ml-3 text-sm font-bold text-gray-700">顧客ステータスを<span className={formData.active ? "text-green-600" : "text-gray-400"}>{formData.active ? "有効" : "無効"}</span>にする</label>
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