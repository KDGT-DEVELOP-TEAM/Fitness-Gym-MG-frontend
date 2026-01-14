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
  } = useCustomerProfile(profileId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#68BE6B]"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* エラーメッセージ */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3">
          <HiExclamation className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-800 font-medium">エラー</p>
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
      )}

      <div className="bg-white rounded-[2rem] shadow-sm border-2 border-gray-50 p-8">
        {/* 基本情報セクション */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 pb-2 border-b border-gray-200">
            基本情報
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <EditableField
              label="氏名"
              value={profileData.name}
              isRequired
              isEditing={editingField === 'name'}
              fieldName="name"
              onEdit={handleEdit}
              onChange={(value) => handleChange('name', value)}
              onBlur={handleBlur}
              icon={<HiUser className="w-4 h-4" />}
            />
            <EditableField
              label="フリガナ"
              value={profileData.kana}
              isRequired
              isEditing={editingField === 'kana'}
              fieldName="kana"
              onEdit={handleEdit}
              onChange={(value) => handleChange('kana', value)}
              onBlur={handleBlur}
              icon={<HiIdentification className="w-4 h-4" />}
            />
            <EditableField
              label="生年月日"
              value={profileData.birthdate}
              isRequired
              isEditing={editingField === 'birthdate'}
              fieldName="birthdate"
              onEdit={handleEdit}
              onChange={(value) => handleChange('birthdate', value)}
              onBlur={handleBlur}
              type="date"
              icon={<HiCalendar className="w-4 h-4" />}
            />
            <EditableField
              label="性別"
              value={profileData.gender === 'MALE' ? '男' : profileData.gender === 'FEMALE' ? '女' : ''}
              isRequired
              isEditing={editingField === 'gender'}
              fieldName="gender"
              onEdit={handleEdit}
              onChange={(value) => handleChange('gender', value === '男' ? 'MALE' : value === '女' ? 'FEMALE' : value)}
              onBlur={handleBlur}
              type="select"
              options={[
                { value: 'MALE', label: '男' },
                { value: 'FEMALE', label: '女' },
              ]}
              icon={<HiUser className="w-4 h-4" />}
            />
            <EditableField
              label="年齢"
              value={profileData.age.toString()}
              isEditing={false}
              fieldName="age"
              onEdit={handleEdit}
              onChange={(value) => handleChange('age', value)}
              onBlur={handleBlur}
              disabled
              icon={<HiCake className="w-4 h-4" />}
            />
            <EditableField
              label="身長 (cm)"
              value={profileData.height}
              isRequired
              isEditing={editingField === 'height'}
              fieldName="height"
              onEdit={handleEdit}
              onChange={(value) => handleChange('height', value)}
              onBlur={handleBlur}
              icon={<HiArrowsExpand className="w-4 h-4" />}
            />
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
              type="text"
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
            icon={<HiAnnotation className="w-4 h-4" />}
          />
        </div>

        {/* 保存中のインジケーター */}
        {saving && (
          <div className="mt-4 flex items-center justify-end text-sm text-gray-500">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#68BE6B] mr-2"></div>
            保存中...
          </div>
        )}
      </div>
    </div>
  );
};
