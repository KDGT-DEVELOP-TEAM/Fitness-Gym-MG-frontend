import React, { useState, useEffect } from 'react';
import { User, UserFormData } from '../../types/user'; 
import { Store } from '../../types/store';

interface UserFormProps {
  initialData?: User;
  stores: Store[];
  onSubmit: (data: UserFormData, userId?: string) => Promise<void>; 
  onDelete?: (id: string) => Promise<void>; 
  isSubmitting: boolean;
}

const UserForm: React.FC<UserFormProps> = ({ initialData, stores, onSubmit, onDelete, isSubmitting }) => {
    
    const [formData, setFormData] = useState<UserFormData>({
        email: '',
        name: '',
        kana: null,
        pass: '', // 🔑 新規登録時は必須、編集時は任意
        role: 'trainer',
        storeId: [],
      });

    const [isActive, setIsActive] = useState(true);
    const isEditMode = !!initialData;

    useEffect(() => {
        if (initialData) {
            setFormData({
                email: initialData.email,
                name: initialData.name,
                kana: initialData.kana,
                pass: '', 
                role: initialData.role as UserFormData['role'],
                storeId: initialData.storeId || [],
            });
            setIsActive(initialData.isActive ?? true);
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'kana' && value === '' ? null : value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // 🔑 提出データの整形
        const dataToSubmit: UserFormData = {
            ...formData,
            isActive: isActive,
            kana: formData.kana || null,
            // 💡 storeIdの制約: manager以外は空配列にする
            storeId: formData.role === 'manager' ? formData.storeId : [],
        };

        // 🔑 onSubmitを呼び出す。内部で signUp -> DB insert が行われる想定
        onSubmit(dataToSubmit, initialData?.id);
    };
    
    const handleDelete = () => {
        if (initialData && onDelete && window.confirm('このユーザーを本当に削除しますか？')) {
            onDelete(initialData.id);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-h-[70vh] overflow-y-auto px-1 custom-scrollbar">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Email */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">メールアドレス</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required disabled={isEditMode} className="w-full border p-2 rounded disabled:bg-gray-100 shadow-sm" />
                </div>

                {/* Role */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">権限ロール</label>
                    <select name="role" value={formData.role} onChange={handleChange} required className="w-full border p-2 rounded shadow-sm">
                        <option value="admin">管理者 (全店舗閲覧可)</option>
                        <option value="manager">店長(指定店舗のみ)</option>
                        <option value="trainer">トレーナー (一般)</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">氏名</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full border p-2 rounded shadow-sm" />
                </div>
                
                {/* Kana */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">ふりがな</label>
                    <input type="text" name="kana" value={formData.kana || ''} onChange={handleChange} className="w-full border p-2 rounded shadow-sm" />
                </div>
            </div>
            
            {/* Password */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">パスワード {isEditMode && '(変更する場合のみ)'}</label>
                <input type="password" name="pass" value={formData.pass} onChange={handleChange} required={!isEditMode} className="w-full border p-2 rounded shadow-sm" />
            </div>
            
            {/* 🔑 manager（店長）の時のみ表示 */}
            {formData.role === 'manager' && (
                <div className="space-y-3 p-4 bg-green-50/50 rounded-xl border border-green-100 animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="block text-sm font-bold text-green-900 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-7h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        担当店舗の設定 (店長権限)
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                        {stores.map((store) => {
                            // formData.storeId が undefined や null の場合の安全策
                            const currentStoreIds = formData.storeId || [];
                            const isSelected = currentStoreIds.includes(store.id);

                            return (
                                <label 
                                    key={store.id} 
                                    className={`
                                        flex items-center p-2.5 rounded-lg border cursor-pointer transition-all
                                        ${isSelected 
                                            ? 'bg-white border-green-500 text-green-700 shadow-sm ring-1 ring-green-500' 
                                            : 'bg-white/50 border-gray-200 text-gray-500 hover:bg-white'}
                                    `}
                                >
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={isSelected}
                                        onChange={() => {
                                            const newIds = isSelected
                                                ? currentStoreIds.filter(id => id !== store.id)
                                                : [...currentStoreIds, store.id];
                                            setFormData({ ...formData, storeId: newIds });
                                        }}
                                    />
                                    <div className={`w-5 h-5 mr-3 rounded-md border flex items-center justify-center transition-colors ${isSelected ? 'bg-green-600 border-green-600' : 'bg-white border-gray-300'}`}>
                                        {isSelected && <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>}
                                    </div>
                                    <span className="text-sm font-bold">{store.name}</span>
                                </label>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* 有効/無効の切り替え */}
            {isEditMode && (
                <div className="flex items-center p-2 bg-gray-50 rounded-lg">
                    <input
                        id="isActive"
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <label htmlFor="isActive" className="ml-2 block text-sm font-bold text-gray-700">
                        このユーザーを有効な状態にする
                    </label>
                </div>
            )}

            <div className="pt-4 space-y-3">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 text-white bg-green-600 rounded-xl font-bold hover:bg-green-700 disabled:bg-gray-400 shadow-md transition-all active:scale-[0.98]"
                >
                    {isSubmitting ? '処理中...' : isEditMode ? '情報を更新する' : '新規ユーザーを登録する'}
                </button>
                
                {isEditMode && onDelete && (
                    <button
                        type="button"
                        onClick={handleDelete}
                        className="w-full px-4 py-2 text-red-600 font-bold bg-white border border-red-200 rounded-xl hover:bg-red-50 transition-all"
                        disabled={isSubmitting}
                    >
                        ユーザーを削除
                    </button>
                )}
            </div>
        </form>
    );
};

export default UserForm;