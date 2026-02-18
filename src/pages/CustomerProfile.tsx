// src/pages/CustomerProfile.tsx

import React from 'react';
import { useParams } from 'react-router-dom';
import {
  HiUser,
  HiIdentification,
  HiCalendar,
  HiCake,
  HiArrowsExpand,
  HiLocationMarker,
  HiMail,
  HiDocumentText,
  HiExclamation,
  HiAnnotation,
} from 'react-icons/hi';
import { EditableField } from '../components/profile/EditableField';
import { useCustomerProfile } from '../hooks/useCustomerProfile';
import { LoadingSpinner } from '../components/common/TableStatusRows';
import { ErrorDisplay } from '../components/common/ErrorDisplay';

export const CustomerProfile: React.FC = () => {
  const { id, customerId } = useParams<{ id?: string; customerId?: string }>();
  // 新しいパス形式を優先、なければ旧パス形式
  const profileId = customerId || id;

  // idが存在しない場合のエラーハンドリング
  if (!profileId) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 text-lg">顧客IDが指定されていません</p>
      </div>
    );
  }

  const {
    profileData,
    loading,
    saving,
    error,
    editingField,
    handleEdit,
    handleChange,
    handleBlur,
    dismissError,
    // 基本情報編集用
    isEditingBasicInfo,
    basicInfoFormData,
    handleStartEditBasicInfo,
    handleCancelEditBasicInfo,
    handleBasicInfoChange,
    handleSaveBasicInfo,
  } = useCustomerProfile(profileId);

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <LoadingSpinner minHeight="min-h-[400px]" />
      </div>
    );
  }

  // エラー表示（プロフィール読み込みエラーの場合）
  if (error && !profileData?.id) {
    return (
      <ErrorDisplay 
        error={error} 
        onRetry={() => window.location.reload()} 
      />
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-white rounded-[2rem] shadow-sm border-2 border-gray-50 p-8 relative">
        {/* エラーメッセージ（絶対配置でシート上部に重ねて表示） */}
        {error && (
          <div className="absolute top-0 left-0 right-0 z-10 px-8 pt-8">
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 shadow-lg animate-in slide-in-from-top-2 duration-200">
              <HiExclamation className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-800 font-medium">エラーが発生しました</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
              <button
                onClick={dismissError}
                className="text-red-400 hover:text-red-600 transition-colors"
                aria-label="エラーを閉じる"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
        {/* 基本情報セクション */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">
              基本情報
            </h2>
            {!isEditingBasicInfo ? (
              <button
                onClick={handleStartEditBasicInfo}
                className="px-4 py-2 text-sm font-medium text-white bg-[#68BE6B] hover:bg-[#5aa85e] rounded-xl transition-colors shadow-sm"
              >
                編集
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleCancelEditBasicInfo}
                  disabled={saving}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleSaveBasicInfo}
                  disabled={saving}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#68BE6B] hover:bg-[#5aa85e] rounded-xl transition-colors shadow-sm disabled:opacity-50"
                >
                  {saving ? '保存中...' : '保存'}
                </button>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            {isEditingBasicInfo ? (
              <>
                {/* 編集モード */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <HiUser className="w-4 h-4 text-[#68BE6B]" />
                    氏名 <span className="text-red-500 text-xs">必須</span>
                  </label>
                  <input
                    type="text"
                    value={basicInfoFormData.name || ''}
                    onChange={(e) => handleBasicInfoChange('name', e.target.value)}
                    className="w-full h-14 px-4 py-3 border-2 border-gray-50 rounded-2xl shadow-sm focus:outline-none focus:border-green-500 focus:ring-0 transition-all"
                    disabled={saving}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <HiIdentification className="w-4 h-4 text-[#68BE6B]" />
                    フリガナ <span className="text-red-500 text-xs">必須</span>
                  </label>
                  <input
                    type="text"
                    value={basicInfoFormData.kana || ''}
                    onChange={(e) => handleBasicInfoChange('kana', e.target.value)}
                    className="w-full h-14 px-4 py-3 border-2 border-gray-50 rounded-2xl shadow-sm focus:outline-none focus:border-green-500 focus:ring-0 transition-all"
                    disabled={saving}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <HiCalendar className="w-4 h-4 text-[#68BE6B]" />
                    生年月日 <span className="text-red-500 text-xs">必須</span>
                  </label>
                  <input
                    type="date"
                    value={basicInfoFormData.birthdate || ''}
                    onChange={(e) => handleBasicInfoChange('birthdate', e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full h-14 px-4 py-3 border-2 border-gray-50 rounded-2xl shadow-sm focus:outline-none focus:border-green-500 focus:ring-0 transition-all"
                    disabled={saving}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <HiUser className="w-4 h-4 text-[#68BE6B]" />
                    性別 <span className="text-red-500 text-xs">必須</span>
                  </label>
                  <select
                    value={basicInfoFormData.gender || 'MALE'}
                    onChange={(e) => handleBasicInfoChange('gender', e.target.value)}
                    className="w-full h-14 px-4 py-3 border-2 border-gray-50 rounded-2xl shadow-sm focus:outline-none focus:border-green-500 focus:ring-0 transition-all appearance-none bg-white"
                    disabled={saving}
                  >
                    <option value="MALE">男</option>
                    <option value="FEMALE">女</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <HiCake className="w-4 h-4 text-[#68BE6B]" />
                    年齢
                  </label>
                  <div className="h-14 px-4 py-3 bg-gray-100 rounded-2xl shadow-sm border-2 border-gray-50 flex items-center text-gray-500">
                    {profileData.age || '-'}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <HiArrowsExpand className="w-4 h-4 text-[#68BE6B]" />
                    身長 <span className="text-red-500 text-xs">必須</span>
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={basicInfoFormData.height || ''}
                    onChange={(e) => {
                      const numericValue = e.target.value.replace(/[^0-9.]/g, '');
                      const parts = numericValue.split('.');
                      const filteredValue = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : numericValue;
                      handleBasicInfoChange('height', filteredValue);
                    }}
                    className="w-full h-14 px-4 py-3 border-2 border-gray-50 rounded-2xl shadow-sm focus:outline-none focus:border-green-500 focus:ring-0 transition-all"
                    disabled={saving}
                  />
                </div>
              </>
            ) : (
              <>
                {/* 表示モード */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <HiUser className="w-4 h-4 text-[#68BE6B]" />
                    氏名
                  </label>
                  <div className="h-14 px-4 py-3 bg-gray-50 rounded-2xl shadow-sm border-2 border-gray-50 flex items-center text-gray-900">
                    {profileData.name || <span className="text-gray-400">未入力</span>}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <HiIdentification className="w-4 h-4 text-[#68BE6B]" />
                    フリガナ
                  </label>
                  <div className="h-14 px-4 py-3 bg-gray-50 rounded-2xl shadow-sm border-2 border-gray-50 flex items-center text-gray-900">
                    {profileData.kana || <span className="text-gray-400">未入力</span>}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <HiCalendar className="w-4 h-4 text-[#68BE6B]" />
                    生年月日
                  </label>
                  <div className="h-14 px-4 py-3 bg-gray-50 rounded-2xl shadow-sm border-2 border-gray-50 flex items-center text-gray-900">
                    {profileData.birthdate || <span className="text-gray-400">未入力</span>}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <HiUser className="w-4 h-4 text-[#68BE6B]" />
                    性別
                  </label>
                  <div className="h-14 px-4 py-3 bg-gray-50 rounded-2xl shadow-sm border-2 border-gray-50 flex items-center text-gray-900">
                    {profileData.gender === 'MALE' ? '男' : profileData.gender === 'FEMALE' ? '女' : <span className="text-gray-400">未入力</span>}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <HiCake className="w-4 h-4 text-[#68BE6B]" />
                    年齢
                  </label>
                  <div className="h-14 px-4 py-3 bg-gray-100 rounded-2xl shadow-sm border-2 border-gray-50 flex items-center text-gray-500">
                    {profileData.age || '-'}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <HiArrowsExpand className="w-4 h-4 text-[#68BE6B]" />
                    身長 (cm)
                  </label>
                  <div className="h-14 px-4 py-3 bg-gray-50 rounded-2xl shadow-sm border-2 border-gray-50 flex items-center text-gray-900">
                    {profileData.height && profileData.height !== 'null' && profileData.height.trim() !== '' ? profileData.height : <span className="text-gray-400">未入力</span>}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 連絡先情報セクション */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 pb-2 border-b border-gray-200">
            連絡先情報
          </h2>
          <div className="grid grid-cols-1 gap-x-6">
            <EditableField
              label="住所"
              value={profileData.address}
              isRequired
              isEditing={editingField === 'address'}
              fieldName="address"
              onEdit={handleEdit}
              onChange={(value) => handleChange('address', value)}
              onBlur={handleBlur}
              isSaving={saving && editingField === 'address'}
              icon={<HiLocationMarker className="w-4 h-4" />}
            />
            <EditableField
              label="メールアドレス"
              value={profileData.email}
              isRequired
              isEditing={editingField === 'email'}
              fieldName="email"
              onEdit={handleEdit}
              onChange={(value) => handleChange('email', value)}
              onBlur={handleBlur}
              type="text"
              isSaving={saving && editingField === 'email'}
              icon={<HiMail className="w-4 h-4" />}
            />
            <EditableField
              label="電話番号"
              value={profileData.phone}
              isRequired
              isEditing={editingField === 'phone'}
              fieldName="phone"
              onEdit={handleEdit}
              onChange={(value) => handleChange('phone', value)}
              onBlur={handleBlur}
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              isSaving={saving && editingField === 'phone'}
              icon={<HiMail className="w-4 h-4" />}
            />
          </div>
        </div>

        {/* 初回姿勢画像セクション */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 pb-2 border-b border-gray-200">
            初回姿勢画像
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['front', 'back', 'left', 'right'].map((position) => (
              <div key={position} className="text-center">
                <div className="aspect-square bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center mb-2">
                  {profileData.postureImages[position as keyof typeof profileData.postureImages] ? (
                    <img
                      src={profileData.postureImages[position as keyof typeof profileData.postureImages]}
                      alt={`${position}姿勢`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <span className="text-gray-400 text-sm">画像なし</span>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  {position === 'front' && '正面'}
                  {position === 'back' && '背面'}
                  {position === 'left' && '左側面'}
                  {position === 'right' && '右側面'}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 医療情報セクション */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 pb-2 border-b border-gray-200">
            医療情報
          </h2>
          <div className="grid grid-cols-1 gap-x-6">
            <EditableField
              label="禁忌事項"
              value={profileData.taboo}
              isEditing={editingField === 'taboo'}
              fieldName="taboo"
              onEdit={handleEdit}
              onChange={(value) => handleChange('taboo', value)}
              onBlur={handleBlur}
              type="textarea"
              isSaving={saving && editingField === 'taboo'}
              icon={<HiExclamation className="w-4 h-4" />}
            />
            <EditableField
              label="既往歴"
              value={profileData.medical}
              isEditing={editingField === 'medical'}
              fieldName="medical"
              onEdit={handleEdit}
              onChange={(value) => handleChange('medical', value)}
              onBlur={handleBlur}
              type="textarea"
              isSaving={saving && editingField === 'medical'}
              icon={<HiDocumentText className="w-4 h-4" />}
            />
          </div>
        </div>

        {/* 備考セクション */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-800 pb-2 border-b border-gray-200">
            備考
          </h2>
          <EditableField
            label="メモ"
            value={profileData.memo}
            isEditing={editingField === 'memo'}
            fieldName="memo"
            onEdit={handleEdit}
            onChange={(value) => handleChange('memo', value)}
            onBlur={handleBlur}
            type="textarea"
            isSaving={saving && editingField === 'memo'}
            icon={<HiAnnotation className="w-4 h-4" />}
          />
        </div>

      </div>
    </div>
  );
};
