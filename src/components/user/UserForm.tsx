import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, UserRequest, UserRole } from '../../types/api/user';
import { UserFormData } from '../../types/form/user';
import { Store } from '../../types/store';
import { validatePasswordPattern } from '../../utils/validators';
import { getAllErrorMessages } from '../../utils/errorMessages';
import { isErrorResponse } from '../../types/api/error';
import { ConfirmModal } from '../common/ConfirmModal';

interface UserFormProps {
  initialData?: User;
  stores: Store[];
  // 引数を UserRequest 一本に統合
  onSubmit: (data: UserRequest) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  isSubmitting: boolean;
  currentUserRole?: UserRole;
}

interface ApiErrorResponse {
  message: string;
}

const UserForm: React.FC<UserFormProps> = ({ initialData, stores, onSubmit, onDelete, isSubmitting, currentUserRole }) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const isEditMode = !!initialData;
  
  // マネージャーの場合はトレーナーのみ選択可能
  // 注意: currentUserRoleはUserRole型なので、直接比較が型安全で明確
  // roleUtils.tsのisManager関数はUser | nullを引数に取るため、ここでは直接比較を使用
  const isManager = currentUserRole === 'MANAGER';

  // 1. フォームの状態管理 (UIの都合に合わせた型)
  // ステータス(active)も管理しやすいように統合しています
  const [formData, setFormData] = useState<UserFormData & { active: boolean }>({
    email: '',
    name: '',
    kana: '',
    pass: '',
    role: 'TRAINER',
    storeId: undefined, // ユーザーは1つの店舗にのみ所属可能
    active: true,
  });

  // 初期データの同期
  useEffect(() => {
    if (initialData) {
      setFormData({
        email: initialData.email,
        name: initialData.name,
        kana: initialData.kana,
        pass: '', // 更新時は空文字スタート
        role: initialData.role,
        storeId: initialData.storeIds && initialData.storeIds.length > 0 ? initialData.storeIds[0] : undefined,
        active: initialData.active,
      });
    }
  }, [initialData]);

  // 汎用的な入力ハンドラー
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: finalValue
    }));
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

    // パスワードバリデーション（新規作成時、または更新時にパスワードが指定されている場合）
    if ((!isEditMode || (formData.pass && formData.pass.trim() !== '')) && formData.pass && !validatePasswordPattern(formData.pass)) {
      setErrorMsg('パスワードは8文字以上16文字以内で、英字と数字を含めてください');
      return;
    }

    // トレーナーと店長の場合、店舗が選択されていることを確認
    if ((formData.role === 'MANAGER' || formData.role === 'TRAINER') && 
        (!formData.storeId || formData.storeId.trim() === '')) {
      setErrorMsg('担当店舗を選択してください');
      return;
    }

    try {
      // 2. 🔑 UserFormData から UserRequest へのマッピング（変換）
      const requestData: UserRequest = {
        email: formData.email,
        name: formData.name,
        kana: formData.kana,
        role: formData.role,
        active: formData.active,
        // 仕様: MANAGERとTRAINERは店舗IDを送る（1つのみ選択可能）
        storeIds: (formData.role === 'MANAGER' || formData.role === 'TRAINER') && formData.storeId
          ? [formData.storeId]
          : [],
      };

      // パスワード: 入力がある場合のみリクエストに含める
      if (formData.pass && formData.pass.trim() !== '') {
        requestData.pass = formData.pass;
      }

      await onSubmit(requestData);
    } catch (err: unknown) {
      // デバッグ: エラーレスポンスの内容を確認
      if (import.meta.env.DEV && axios.isAxiosError(err)) {
        console.log('[UserForm] Error response:', {
          status: err.response?.status,
          data: err.response?.data,
          message: err.response?.data?.message,
          code: (err.response?.data as any)?.code
        });
      }
      
      // 複数エラーメッセージを取得
      const allErrors = getAllErrorMessages(err);
      if (allErrors.length > 0) {
        setErrorMessages(allErrors);
        // 最初のエラーメッセージを単一エラーとしても設定（後方互換性）
        const firstError = allErrors[0];
        if (firstError.includes("関連データが存在するため")) {
          setErrorMsg("このユーザーにはレッスン履歴があるため削除できません。");
        } else if (firstError.includes("有効ユーザーは削除できません")) {
          setErrorMsg("有効なステータスのままでは削除できません。");
        } else {
          setErrorMsg(firstError);
        }
      } else {
        // エラーメッセージを取得
        let message = "保存中にエラーが発生しました。";
        if (axios.isAxiosError(err)) {
          if (err.response?.data && isErrorResponse(err.response.data)) {
            message = err.response.data.message || err.message;
          } else {
            message = (err.response?.data as { message?: string })?.message || err.message;
          }
        } else if (err instanceof Error) {
          message = err.message;
        }
        
        if (message.includes("関連データが存在するため")) {
          setErrorMsg("このユーザーにはレッスン履歴があるため削除できません。");
        } else if (message.includes("有効ユーザーは削除できません")) {
          setErrorMsg("有効なステータスのままでは削除できません。");
        } else {
          setErrorMsg(message);
        }
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
                    {/* Email */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">メールアドレス <RequiredBadge /></label>
                        <input 
                          type="email" 
                          name="email" 
                          value={formData.email} 
                          onChange={handleInput}
                          onInvalid={handleInvalidInput}
                          data-field-name="メールアドレス"
                          required 
                          maxLength={255} 
                          disabled={isEditMode} 
                          className="w-full h-14 px-4 py-3 border-2 border-gray-50 rounded-2xl shadow-sm focus:outline-none focus:border-green-500 focus:ring-0 transition-all text-gray-700 font-medium disabled:bg-gray-50" 
                        />
                    </div>

                    {/* Role */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">権限 <RequiredBadge /></label>
                        <select 
                          name="role" 
                          value={formData.role} 
                          onChange={handleInput}
                          onInvalid={handleInvalidSelect}
                          data-field-name="権限"
                          required 
                          className="w-full h-14 px-4 py-3 border-2 border-gray-50 rounded-2xl shadow-sm focus:outline-none focus:border-green-500 focus:ring-0 transition-all text-gray-700 font-medium cursor-pointer appearance-none bg-white"
                        >
                            {!isManager && <option value="ADMIN">管理者</option>}
                            {!isManager && <option value="MANAGER">店長</option>}
                            <option value="TRAINER">トレーナー</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">氏名 <RequiredBadge /></label>
                        <input 
                          type="text" 
                          name="name" 
                          value={formData.name} 
                          onChange={handleInput}
                          onInvalid={handleInvalidInput}
                          data-field-name="氏名"
                          required 
                          minLength={2} 
                          maxLength={100} 
                          className="w-full h-14 px-4 py-3 border-2 border-gray-50 rounded-2xl shadow-sm focus:outline-none focus:border-green-500 focus:ring-0 transition-all text-gray-700 font-medium" 
                        />
                    </div>
                    
                    {/* Kana */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">フリガナ <RequiredBadge /></label>
                        <input 
                          type="text" 
                          name="kana" 
                          value={formData.kana} 
                          onChange={handleInput}
                          onInvalid={handleInvalidInput}
                          data-field-name="フリガナ"
                          required 
                          minLength={2} 
                          maxLength={100} 
                          className="w-full h-14 px-4 py-3 border-2 border-gray-50 rounded-2xl shadow-sm focus:outline-none focus:border-green-500 focus:ring-0 transition-all text-gray-700 font-medium" 
                        />
                    </div>
                </div>
                
                {/* Password */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">パスワード {isEditMode && '(変更する場合のみ)'}</label>
                    <input type="text" name="pass" value={formData.pass} onChange={handleChange} required={!isEditMode} className="w-full h-14 px-4 py-3 border-2 border-gray-50 rounded-2xl shadow-sm focus:outline-none focus:border-green-500 focus:ring-0 transition-all text-gray-700 font-medium" />
                </div>
            </section>
            
            {/* 🔑 manager（店長）とtrainer（トレーナー）の時のみ表示 */}
            {(formData.role === 'MANAGER' || formData.role === 'TRAINER') && (
                <div className="space-y-3 p-4 bg-white rounded-2xl border-2 border-gray-50 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-7h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        担当店舗の設定 {formData.role === 'MANAGER' ? '(店長権限)' : '(トレーナー権限)'} <RequiredBadge />
                    </label>

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
                                    required
                                    className="hidden"
                                />
                                <div className={`w-5 h-5 mr-3 rounded-md border flex items-center justify-center transition-colors ${formData.storeId === store.id ? 'bg-green-600 border-green-600' : 'bg-white border-gray-300'}`}>
                                    {formData.storeId === store.id && <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>}
                                </div>
                                <span className="text-sm font-bold">{store.name}</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}

            {/* 有効/無効の切り替え */}
            {isEditMode && (
                <div className="flex items-center p-4 bg-gray-50 rounded-2xl border-2 border-gray-50 shadow-sm">
                    <input
                        id="active"
                        name="active"
                        type="checkbox"
                        checked={formData.active}
                        onChange={handleChange}
                        className="w-5 h-5 text-green-600 rounded"
                    />
                    <label htmlFor="active" className="ml-3 text-sm font-bold text-gray-700">
                        このユーザーを有効な状態にする
                    </label>
                </div>
            )}

            <div className="pt-4 space-y-3">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-700 shadow-lg transition-all active:scale-[0.98] disabled:opacity-50"
                >
                    {isSubmitting ? '処理中...' : isEditMode ? '情報を更新する' : '新規ユーザーを登録する'}
                </button>
                
                {isEditMode && onDelete && (
                    <button
                        type="button"
                        onClick={() => {
                            if (initialData) {
                                setShowDeleteConfirm(true);
                            }
                        }}
                        className="w-full py-3 text-red-500 font-bold hover:bg-red-50 rounded-2xl transition-all"
                        disabled={isSubmitting}
                    >
                        ユーザーを削除
                    </button>
                )}
            </div>

            {/* 削除確認モーダル */}
            <ConfirmModal
                isOpen={showDeleteConfirm}
                title="ユーザーの削除"
                message="本当に削除しますか？"
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
        </form>
    );
};

export default UserForm;