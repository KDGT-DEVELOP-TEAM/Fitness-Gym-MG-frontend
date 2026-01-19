import React, { useState } from 'react';
import axios from 'axios';
import { Customer, CustomerRequest } from '../../types/api/customer';
import { CustomerFormData } from '../../types/form/customer';
import { validatePastDate } from '../../utils/validators';
import { getAllErrorMessages } from '../../utils/errorMessages';
import { isErrorResponse } from '../../types/api/error';
import { useAuth } from '../../context/AuthContext';
import { useStores } from '../../hooks/useStore';
import { ConfirmModal } from '../common/ConfirmModal';
import { isAdmin, isManager } from '../../utils/roleUtils';

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
  const { user: authUser } = useAuth();
  const { stores, loading: storesLoading } = useStores();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showActiveWarning, setShowActiveWarning] = useState(false);
  
  const showStoreSelection = isAdmin(authUser) || isManager(authUser); // ADMINとMANAGERの両方で店舗選択UIを表示
  
  const [formData, setFormData] = useState<CustomerFormData & { active: boolean }>({
    name: initialData?.name || '',
    kana: initialData?.kana || '',
    gender: initialData?.gender || 'MALE', // バックエンドのGender Enum（MALE/FEMALE）に対応
    birthday: initialData?.birthdate || '', // バックエンドのCustomerResponse.birthdateをフォームのbirthdayに変換
    height: initialData?.height?.toString() || '', // 入力中は文字列として保持
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    address: initialData?.address || '',
    medical: initialData?.medical || '',
    taboo: initialData?.taboo || '',
    memo: initialData?.memo || '',
    storeId: undefined, // 新規作成時は未選択
    active: initialData?.active ?? true, // フォーム内で管理（バックエンドのCustomer.activeに対応）
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let finalValue: any = value;

    if (type === 'checkbox') {
      finalValue = (e.target as HTMLInputElement).checked;
    } else if (name === 'phone') {
      // 電話番号：数値以外の文字（ハイフン含む）をフィルタリング
      const numericValue = value.replace(/[^0-9]/g, '');
      finalValue = numericValue;
    } else if (name === 'height') {
      // 身長：入力中は文字列として保持（即座の範囲チェックは行わない）
      // 数値のみを許可（小数点を含む）
      const numericValue = value.replace(/[^0-9.]/g, '');
      // 複数の小数点を1つに制限
      const parts = numericValue.split('.');
      if (parts.length > 2) {
        finalValue = parts[0] + '.' + parts.slice(1).join('');
      } else {
        finalValue = numericValue;
      }
    } else if (name === 'name' || name === 'kana' || name === 'address') {
      // 氏名、フリガナ、住所：先頭・末尾の空白をトリム（入力中はトリムしないが、送信時に検証）
      // 入力時はそのまま保持（ユーザーが入力中にトリムされると混乱するため）
      finalValue = value;
    }

    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleHeightBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || value.trim() === '') {
      // 空の場合は0に設定
      setFormData(prev => ({ ...prev, height: 0 }));
      return;
    }

    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      // 数値でない場合は0に設定
      setFormData(prev => ({ ...prev, height: 0 }));
      return;
    }

    // 範囲チェックと補正
    let finalValue: number;
    if (numValue < 50) {
      finalValue = 50;
    } else if (numValue > 300) {
      finalValue = 300;
    } else {
      finalValue = numValue;
    }

    setFormData(prev => ({ ...prev, height: finalValue }));
  };

  // HTML5バリデーションメッセージを日本語化
  const handleInvalidInput = (e: React.InvalidEvent<HTMLInputElement>) => {
    e.preventDefault();
    const fieldName = e.currentTarget.getAttribute('data-field-name') || 'この項目';
    const input = e.currentTarget;
    
    // メールアドレスの形式エラーの場合
    if (input.type === 'email' && input.validity.typeMismatch) {
      input.setCustomValidity('有効なメールアドレスを入力してください');
    }
    // 必須項目が空の場合
    else if (input.validity.valueMissing) {
      input.setCustomValidity(`${fieldName}を入力してください`);
    }
    // その他のバリデーションエラー
    else {
      input.setCustomValidity(`${fieldName}が正しくありません`);
    }
  };

  const handleInvalidSelect = (e: React.InvalidEvent<HTMLSelectElement>) => {
    e.preventDefault();
    const fieldName = e.currentTarget.getAttribute('data-field-name') || 'この項目';
    e.currentTarget.setCustomValidity(`${fieldName}を選択してください`);
  };

  // 入力時にカスタムバリデーションメッセージをクリア
  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.setCustomValidity('');
    handleChange(e);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // 必須項目の空白チェック（先頭・末尾の空白をトリムして検証）
    if (!formData.name.trim()) {
      setErrorMsg('氏名は必須です');
      return;
    }
    if (!formData.kana.trim()) {
      setErrorMsg('フリガナは必須です');
      return;
    }
    if (!formData.address.trim()) {
      setErrorMsg('住所は必須です');
      return;
    }
    if (!formData.email.trim()) {
      setErrorMsg('メールアドレスは必須です');
      return;
    }
    if (!formData.phone.trim()) {
      setErrorMsg('電話番号は必須です');
      return;
    }

    // 電話番号のバリデーション（ハイフンを含めない）
    if (formData.phone.includes('-')) {
      setErrorMsg('電話番号にハイフン（-）を含めることはできません');
      return;
    }
    if (!/^[0-9]{10,15}$/.test(formData.phone.trim())) {
      setErrorMsg('電話番号は10文字以上15文字以下の数字のみで入力してください');
      return;
    }

    // 過去日付チェック
    if (formData.birthday && !validatePastDate(formData.birthday)) {
      setErrorMsg('生年月日は過去の日付である必要があります');
      return;
    }

    // 身長の範囲チェック（文字列の場合は数値に変換）
    const heightValue = typeof formData.height === 'string' ? parseFloat(formData.height) : formData.height;
    if (isNaN(heightValue) || heightValue < 50 || heightValue > 300) {
      setErrorMsg('身長は50cm以上300cm以下である必要があります');
      return;
    }

    try {
      // フォーム用データを API リクエスト用に整形
      // birthday: type="date"のinputから取得されるため、ISO8601形式（YYYY-MM-DD）の文字列として送信
      // height: number型として送信され、Spring Bootが自動的にBigDecimalに変換
      // 身長を数値に変換（文字列の場合は数値に変換）
      const heightNumber = typeof formData.height === 'string' ? parseFloat(formData.height) : formData.height;

      const requestData: CustomerRequest = {
        name: formData.name.trim(), // 先頭・末尾の空白をトリム
        kana: formData.kana.trim(), // 先頭・末尾の空白をトリム
        gender: formData.gender,
        birthday: formData.birthday, // ISO8601形式の文字列（YYYY-MM-DD）
        height: heightNumber, // number型、Spring BootがBigDecimalに自動変換
        email: formData.email.trim(), // 先頭・末尾の空白をトリム
        phone: formData.phone.trim(), // 先頭・末尾の空白をトリム（ハイフンは既にフィルタリング済み）
        address: formData.address.trim(), // 先頭・末尾の空白をトリム
        medical: formData.medical?.trim() || undefined, // 任意項目：空白の場合はundefined
        taboo: formData.taboo?.trim() || undefined, // 任意項目：空白の場合はundefined
        memo: formData.memo?.trim() || undefined, // 任意項目：空白の場合はundefined
        active: formData.active, // バックエンドのCustomerRequestは`active`フィールドを使用
        storeId: formData.storeId || undefined, // ADMINの場合、選択した店舗IDを送信
        // 更新時は既存のfirstPostureGroupIdを保持（nullの場合はフィールドを送信しない）
        ...(initialData?.firstPostureGroupId !== undefined && initialData?.firstPostureGroupId !== null 
          ? { firstPostureGroupId: initialData.firstPostureGroupId } 
          : {}),
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
          // ネットワークエラーの場合
          if (!err.response) {
            message = "ネットワークエラーが発生しました。インターネット接続を確認してください。";
          } else if (err.response?.data && isErrorResponse(err.response.data)) {
            // ErrorResponse形式の場合
            message = err.response.data.message || err.message || "保存中にエラーが発生しました。";
          } else {
            // その他のエラー
            message = (err.response?.data as { message?: string })?.message || err.message || "保存中にエラーが発生しました。";
          }
        } else if (err instanceof Error) {
          message = err.message || "保存中にエラーが発生しました。";
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
            <label className="block text-sm font-bold text-gray-700 mb-1">氏名 <RequiredBadge /></label>
            <input 
              name="name" 
              value={formData.name} 
              onChange={handleInput} 
              onInvalid={handleInvalidInput}
              data-field-name="氏名"
              required 
              maxLength={100} 
              className="w-full h-14 px-4 py-3 border-2 border-gray-50 rounded-2xl shadow-sm focus:outline-none focus:border-green-500 focus:ring-0 transition-all text-gray-700 font-medium" 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">フリガナ <RequiredBadge /></label>
            <input 
              name="kana" 
              value={formData.kana || ''} 
              onChange={handleInput} 
              onInvalid={handleInvalidInput}
              data-field-name="フリガナ"
              required 
              maxLength={100} 
              className="w-full h-14 px-4 py-3 border-2 border-gray-50 rounded-2xl shadow-sm focus:outline-none focus:border-green-500 focus:ring-0 transition-all text-gray-700 font-medium" 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">生年月日 <RequiredBadge /></label>
            <input 
              type="date" 
              name="birthday" 
              value={formData.birthday} 
              onChange={handleInput}
              onInvalid={handleInvalidInput}
              data-field-name="生年月日"
              required 
              max={new Date().toISOString().split('T')[0]} // 今日以前の日付のみ選択可能
              className="w-full h-14 px-4 py-3 border-2 border-gray-50 rounded-2xl shadow-sm focus:outline-none focus:border-green-500 focus:ring-0 transition-all text-gray-700 font-medium" 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">性別 <RequiredBadge /></label>
            <select 
              name="gender" 
              value={formData.gender} 
              onChange={handleInput}
              onInvalid={handleInvalidSelect}
              data-field-name="性別"
              required
              className="w-full h-14 px-4 py-3 border-2 border-gray-50 rounded-2xl shadow-sm focus:outline-none focus:border-green-500 focus:ring-0 transition-all text-gray-700 font-medium cursor-pointer appearance-none bg-white"
            >
              <option value="">選択してください</option>
              <option value="MALE">男</option>
              <option value="FEMALE">女</option>
            </select>
          </div>
        </div>
        
        {/* 店舗選択（ADMINとMANAGERの場合に表示） */}
        {showStoreSelection && !initialData && (
          <div className="space-y-3 p-4 bg-white rounded-2xl border-2 border-gray-50 shadow-sm">
            <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-7h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              担当店舗の設定 <RequiredBadge />
            </label>
            {storesLoading ? (
              <div className="text-sm text-gray-500">店舗情報を読み込み中...</div>
            ) : stores.length === 0 ? (
              <div className="text-sm text-red-600">店舗が見つかりません</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                {stores.map((store) => (
                  <label
                    key={store.id}
                    className={`
                      flex items-center p-2.5 rounded-2xl border-2 cursor-pointer transition-all shadow-sm
                      ${formData.storeId === store.id
                        ? 'bg-white border-green-500 text-green-700 ring-1 ring-green-500'
                        : 'bg-white/50 border-gray-50 text-gray-500 hover:bg-white'}
                    `}
                  >
                    <input
                      type="radio"
                      name="storeId"
                      value={store.id}
                      checked={formData.storeId === store.id}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, storeId: e.target.value }));
                        // カスタムバリデーションメッセージをクリア
                        const radioGroup = document.querySelectorAll('input[name="storeId"]');
                        radioGroup.forEach((radio) => {
                          (radio as HTMLInputElement).setCustomValidity('');
                        });
                      }}
                      onInvalid={handleInvalidInput}
                      data-field-name="担当店舗"
                      required={showStoreSelection && !initialData}
                      className="hidden"
                    />
                    <div className={`w-5 h-5 mr-3 rounded-md border flex items-center justify-center transition-colors ${formData.storeId === store.id ? 'bg-green-600 border-green-600' : 'bg-white border-gray-300'}`}>
                      {formData.storeId === store.id && <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>}
                    </div>
                    <span className="text-sm font-bold">{store.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* 連絡先セクション */}
      <section className="space-y-4">
        <h3 className="text-lg font-medium border-b pb-2">連絡先・詳細</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-1">住所 <RequiredBadge /></label>
            <input 
              type="text" 
              name="address" 
              value={formData.address || ''} 
              onChange={handleInput}
              onInvalid={handleInvalidInput}
              data-field-name="住所"
              required 
              maxLength={500} 
              className="w-full h-14 px-4 py-3 border-2 border-gray-50 rounded-2xl shadow-sm focus:outline-none focus:border-green-500 focus:ring-0 transition-all text-gray-700 font-medium" 
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-1">メールアドレス <RequiredBadge /></label>
            <input 
              type="email" 
              name="email" 
              value={formData.email || ''} 
              onChange={handleInput}
              onInvalid={handleInvalidInput}
              data-field-name="メールアドレス"
              required 
              maxLength={255} 
              className="w-full h-14 px-4 py-3 border-2 border-gray-50 rounded-2xl shadow-sm focus:outline-none focus:border-green-500 focus:ring-0 transition-all text-gray-700 font-medium" 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">電話番号 <RequiredBadge /></label>
            <input 
              type="tel" 
              name="phone" 
              value={formData.phone || ''} 
              onChange={handleInput}
              onInvalid={handleInvalidInput}
              data-field-name="電話番号"
              required 
              maxLength={15}
              inputMode="numeric"
              pattern="[0-9]*"
              className="w-full h-14 px-4 py-3 border-2 border-gray-50 rounded-2xl shadow-sm focus:outline-none focus:border-green-500 focus:ring-0 transition-all text-gray-700 font-medium" 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">身長 (cm) <RequiredBadge /></label>
            <input 
              type="text" 
              inputMode="decimal"
              step="0.1" 
              name="height" 
              value={formData.height || ''} 
              onChange={handleChange} 
              onBlur={handleHeightBlur}
              onInvalid={handleInvalidInput}
              data-field-name="身長"
              required 
              min="50" 
              max="300" 
              className="w-full h-14 px-4 py-3 border-2 border-gray-50 rounded-2xl shadow-sm focus:outline-none focus:border-green-500 focus:ring-0 transition-all text-gray-700 font-medium" 
            />
          </div>
        </div>
      </section>

      {/* 健康情報セクション */}
      <section className="space-y-4">
        <h3 className="text-lg font-medium border-b pb-2">健康情報・禁忌等</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">禁忌事項 (Taboo)</label>
            <textarea name="taboo" value={formData.taboo || ''} onChange={handleChange} rows={2} maxLength={100} className="w-full px-4 py-3 border-2 border-red-200 rounded-2xl bg-red-50 shadow-sm focus:outline-none focus:border-red-300 focus:ring-0 transition-all text-gray-700 font-medium" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">既往歴 (Medical History)</label>
            <textarea name="medical" value={formData.medical || ''} onChange={handleChange} rows={2} maxLength={100} className="w-full px-4 py-3 border-2 border-gray-50 rounded-2xl shadow-sm focus:outline-none focus:border-green-500 focus:ring-0 transition-all text-gray-700 font-medium" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">自由記入メモ (Memo)</label>
            <textarea name="memo" value={formData.memo || ''} onChange={handleChange} rows={3} maxLength={500} className="w-full px-4 py-3 border-2 border-gray-50 rounded-2xl shadow-sm focus:outline-none focus:border-green-500 focus:ring-0 transition-all text-gray-700 font-medium" />
          </div>
        </div>

        <div className="flex items-center p-4 bg-gray-50 rounded-2xl border-2 border-gray-50 shadow-sm">
          <input type="checkbox" id="active" name="active" checked={formData.active} onChange={handleChange} className="w-5 h-5 text-green-600 rounded" />
          <label htmlFor="active" className="ml-3 text-sm font-bold text-gray-700">顧客ステータスを<span className={formData.active ? "text-green-600" : "text-gray-400"}>{formData.active ? "有効" : "無効"}</span>にする</label>
        </div>
      </section>

      <div className="pt-4 space-y-3">
        <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-700 shadow-lg transition-all active:scale-[0.98] disabled:opacity-50">
          {isSubmitting ? '保存中...' : initialData ? '情報を更新する' : '新規登録する'}
        </button>

        {initialData && onDelete && (
          <button 
            type="button" 
            onClick={() => {
              if (initialData) {
                if (initialData.active) {
                  setShowActiveWarning(true);
                } else {
                  setShowDeleteConfirm(true);
                }
              }
            }} 
            disabled={isSubmitting} 
            className="w-full py-3 text-red-500 font-bold hover:bg-red-50 rounded-2xl transition-all"
          >
            この顧客データを削除する
          </button>
        )}
      </div>

      {/* 削除確認モーダル */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="顧客データの削除"
        message="この顧客データを完全に削除してもよろしいですか？"
        confirmText="削除"
        cancelText="キャンセル"
        onConfirm={() => {
          if (initialData && onDelete) {
            onDelete(initialData.id);
          }
          setShowDeleteConfirm(false);
        }}
        onCancel={() => setShowDeleteConfirm(false)}
        isLoading={isSubmitting}
      />

      {/* 有効状態の警告モーダル */}
      <ConfirmModal
        isOpen={showActiveWarning}
        title="削除できません"
        message="この顧客は有効な状態です。削除するには先に無効化してください。"
        confirmText="了解"
        cancelText=""
        onConfirm={() => setShowActiveWarning(false)}
        onCancel={() => setShowActiveWarning(false)}
        isLoading={false}
      />
    </form>
  );
};