// src/components/customers/CustomerForm.tsx
import React, { useState, useEffect } from 'react';
import { Customer, CustomerFormData } from '../../types/customer';
// import { supabase } from '../../supabase/supabaseClient';

interface CustomerFormProps {
  initialData?: Customer;
  onSubmit: (data: CustomerFormData) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  isSubmitting: boolean;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({ initialData, onSubmit, onDelete, isSubmitting }) => {
  // const [postureImages, setPostureImages] = useState<{position: string, url: string}[]>([]);
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
    isActive: initialData?.isActive ?? true,
    firstPostureGroupId: initialData?.firstPostureGroupId || null,
  });

  // useEffect(() => {
  //   const fetchFirstPosture = async () => {
  //     if (!initialData?.id) return;

  //     // 1. 最古のグループIDを取得
  //     const { data: groupData } = await supabase
  //       .from('posture_groups')
  //       .select('id')
  //       .eq('customer_id', initialData.id)
  //       .order('created_at', { ascending: true })
  //       .limit(1)
  //       .single();

  //     if (!groupData) return;

  //     // 2. 💡 ここが勝負所です。顧客IDを挟まず、グループID直下をリストアップします
  //     const { data: files, error: listError } = await supabase.storage
  //       .from('postures')
  //       .list(`${groupData.id}`);

  //     console.log(`--- フォルダ [${groupData.id}] の中身をチェック ---`);
  //     console.log("📂 発見されたファイル:", files?.map(f => f.name));

  //     if (!files || files.length === 0) {
  //       console.warn("⚠️ 指定したフォルダは空、または存在しません。");
  //       // 💡 ここで空なら、手動でリネームした「a0ed...」がバケットの「直下」にあるか確認が必要です
  //     }

  //     const { data: imagesData } = await supabase
  //       .from('posture_images')
  //       .select('position')
  //       .eq('posture_group_id', groupData.id);

  //     if (imagesData && files) {
  //       const imagesWithUrls = await Promise.all(imagesData.map(async (img) => {
  //         // Storage内のファイル名と、DBのposition(frontなど)を照合
  //         const actualFile = files.find(f => f.name.toLowerCase().startsWith(img.position.toLowerCase()));
          
  //         if (!actualFile) return { position: img.position, url: '' };

  //         // 💡 発見したファイル名を使ってURLを生成
  //         const cleanPath = `${groupData.id}/${actualFile.name}`;
  //         const { data: signedData } = await supabase.storage
  //           .from('postures')
  //           .createSignedUrl(cleanPath, 3600);
          
  //         return {
  //           position: img.position,
  //           url: signedData?.signedUrl || '' 
  //         };
  //       }));
  //       setPostureImages(imagesWithUrls);
  //     }
  //   };
  //   fetchFirstPosture();
  // }, [initialData?.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const RequiredBadge = () => (
    <span className="ml-2 px-1 bg-red-500 text-white text-[10px] font-black rounded shadow-sm inline-block transform -translate-y-0.5">
      必須
    </span>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto px-2">
      {/* 1. 初回姿勢画像セクション（更新時のみ表示） */}
      {/* {initialData && (
        <section className="space-y-4">
          <h3 className="text-lg font-medium border-b pb-2">初回姿勢画像</h3>
          {postureImages.length > 0 ? (
            <div className="grid grid-cols-4 gap-2 bg-gray-50 p-3 rounded-2xl border border-gray-100">
              {postureImages.map((img, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="aspect-[3/4] rounded-lg overflow-hidden border bg-white shadow-inner">
                    <img src={img.url} alt={img.position} className="w-full h-full object-cover" />
                  </div>
                  <p className="text-[8px] font-black text-center text-gray-400 uppercase">{img.position}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <p className="text-xs font-bold text-gray-400">初回姿勢画像が登録されていません</p>
            </div>
          )}
        </section>
      )} */}
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