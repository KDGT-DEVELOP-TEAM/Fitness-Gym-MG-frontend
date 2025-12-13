import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { HiUser, HiIdentification, HiCalendar, HiCake, HiArrowsExpand, HiLocationMarker, HiMail, HiDocumentText, HiExclamation, HiAnnotation } from 'react-icons/hi';

// アイコンコンポーネント
const UserIcon = (props: { className?: string }) => {
  const Icon = HiUser as any;
  return <Icon {...props} />;
};

const IdentificationIcon = (props: { className?: string }) => {
  const Icon = HiIdentification as any;
  return <Icon {...props} />;
};

const CalendarIcon = (props: { className?: string }) => {
  const Icon = HiCalendar as any;
  return <Icon {...props} />;
};

const CakeIcon = (props: { className?: string }) => {
  const Icon = HiCake as any;
  return <Icon {...props} />;
};

const ArrowsExpandIcon = (props: { className?: string }) => {
  const Icon = HiArrowsExpand as any;
  return <Icon {...props} />;
};

const LocationIcon = (props: { className?: string }) => {
  const Icon = HiLocationMarker as any;
  return <Icon {...props} />;
};

const MailIcon = (props: { className?: string }) => {
  const Icon = HiMail as any;
  return <Icon {...props} />;
};

const DocumentIcon = (props: { className?: string }) => {
  const Icon = HiDocumentText as any;
  return <Icon {...props} />;
};

const ExclamationIcon = (props: { className?: string }) => {
  const Icon = HiExclamation as any;
  return <Icon {...props} />;
};

const AnnotationIcon = (props: { className?: string }) => {
  const Icon = HiAnnotation as any;
  return <Icon {...props} />;
};

interface CustomerProfileData {
  id: string;
  furigana: string;
  name: string;
  gender: '男性' | '女性' | 'その他' | '';
  birthDate: string;
  age: number;
  height: string;
  address: string;
  email: string;
  medicalHistory: string;
  contraindications: string;
  memo: string;
  postureImages: {
    front?: string;
    back?: string;
    left?: string;
    right?: string;
  };
}

interface EditableFieldProps {
  label: string;
  value: string;
  isRequired?: boolean;
  isEditing: boolean;
  fieldName: keyof CustomerProfileData;
  onEdit: (fieldName: keyof CustomerProfileData) => void;
  onChange: (value: string) => void;
  onBlur: () => void;
  type?: 'text' | 'date' | 'select' | 'textarea';
  options?: { value: string; label: string }[];
  disabled?: boolean;
  icon?: React.ReactNode;
}

const EditableField: React.FC<EditableFieldProps> = ({
  label,
  value,
  isRequired = false,
  isEditing,
  fieldName,
  onEdit,
  onChange,
  onBlur,
  type = 'text',
  options = [],
  disabled = false,
  icon,
}) => {
  const showValidationError = isRequired && !value && !isEditing;

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          {icon && <span className="text-[#68BE6B]">{icon}</span>}
          {label}
        </label>
      </div>

      {isEditing ? (
        <>
          {type === 'select' ? (
            <select
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onBlur={onBlur}
              autoFocus
              className="w-full px-3 py-2 border border-[#68BE6B] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#68BE6B] focus:border-transparent appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 viewBox=%220 0 20 20%22%3E%3Cpath stroke=%22%236B7280%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22 stroke-width=%221.5%22 d=%22m6 8 4 4 4-4%22/%3E%3C/svg%3E')] bg-[length:1.5em_1.5em] bg-[right_0.5rem_center] bg-no-repeat pr-10"
              style={{
                backgroundPosition: `calc(100% - ${value ? value.length * 0.6 : 6}ch) center`,
              }}
            >
              <option value="">選択してください</option>
              {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : type === 'textarea' ? (
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onBlur={onBlur}
              autoFocus
              rows={4}
              className="w-full px-3 py-2 border border-[#68BE6B] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#68BE6B] focus:border-transparent resize-none"
            />
          ) : type === 'date' ? (
            <div
              className="flex items-center gap-2"
              onBlur={(e) => {
                // フォーカスが日付入力グループの外に移動した場合のみ保存
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  onBlur();
                }
              }}
            >
              <input
                type="text"
                value={value.split('-')[0] || ''}
                onChange={(e) => {
                  const year = e.target.value;
                  const parts = value.split('-');
                  onChange(`${year}-${parts[1] || '01'}-${parts[2] || '01'}`);
                }}
                autoFocus
                placeholder="年"
                maxLength={4}
                className="w-20 px-3 py-2 border border-[#68BE6B] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#68BE6B] focus:border-transparent text-center"
              />
              <span className="text-gray-700">年</span>
              <input
                type="text"
                value={value.split('-')[1] || ''}
                onChange={(e) => {
                  const month = e.target.value;
                  const parts = value.split('-');
                  onChange(`${parts[0] || '2000'}-${month}-${parts[2] || '01'}`);
                }}
                placeholder="月"
                maxLength={2}
                className="w-16 px-3 py-2 border border-[#68BE6B] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#68BE6B] focus:border-transparent text-center"
              />
              <span className="text-gray-700">月</span>
              <input
                type="text"
                value={value.split('-')[2] || ''}
                onChange={(e) => {
                  const day = e.target.value;
                  const parts = value.split('-');
                  onChange(`${parts[0] || '2000'}-${parts[1] || '01'}-${day}`);
                }}
                placeholder="日"
                maxLength={2}
                className="w-16 px-3 py-2 border border-[#68BE6B] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#68BE6B] focus:border-transparent text-center"
              />
              <span className="text-gray-700">日</span>
            </div>
          ) : (
            <input
              type={type}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onBlur={onBlur}
              autoFocus
              className="w-full px-3 py-2 border border-[#68BE6B] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#68BE6B] focus:border-transparent"
            />
          )}
        </>
      ) : (
        <div className="relative">
          <div className={`px-3 py-2 bg-gray-50 rounded-lg ${disabled ? 'text-gray-500' : 'text-gray-900'} pr-16`}>
            {value || (
              <span className="text-gray-400">
                {showValidationError ? '必須項目を入力してください' : '未入力'}
              </span>
            )}
          </div>
          {!disabled && (
            <button
              onClick={() => onEdit(fieldName)}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-sm text-white bg-[#68BE6B] hover:bg-[#5aa85e] rounded border border-[#68BE6B] transition-colors"
              aria-label={`${label}を編集`}
            >
              編集
            </button>
          )}
        </div>
      )}
      {showValidationError && (
        <p className="mt-1 text-sm text-red-500">必須項目を入力してください</p>
      )}
    </div>
  );
};

export const CustomerProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<keyof CustomerProfileData | null>(null);
  const [profileData, setProfileData] = useState<CustomerProfileData>({
    id: id || '',
    furigana: '',
    name: '',
    gender: '',
    birthDate: '',
    age: 0,
    height: '',
    address: '',
    email: '',
    medicalHistory: '',
    contraindications: '',
    memo: '',
    postureImages: {
      front: undefined,
      back: undefined,
      left: undefined,
      right: undefined,
    },
  });

  // 年齢を計算する関数
  const calculateAge = (birthDate: string): number => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  useEffect(() => {
    // Mock data loading
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));
        // Data is already set in state
        // TODO: Call actual API here
        // const data = await fetchCustomerProfile(id);
        // setProfileData(data);
      } catch (error) {
        console.error('Failed to load profile:', error);
        setError('プロフィールの読み込みに失敗しました。');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // 生年月日が変更された時に年齢を自動更新
  useEffect(() => {
    if (profileData.birthDate) {
      const newAge = calculateAge(profileData.birthDate);
      setProfileData((prev) => ({ ...prev, age: newAge }));
    }
  }, [profileData.birthDate]);

  const handleEdit = (fieldName: keyof CustomerProfileData) => {
    setEditingField(fieldName);
  };

  const handleChange = (fieldName: keyof CustomerProfileData, value: string) => {
    setProfileData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleBlur = async () => {
    if (!editingField) return;

    try {
      setSaving(true);
      setError(null);
      // Simulate API call to save data
      await new Promise((resolve) => setTimeout(resolve, 300));
      console.log('Saved:', editingField, profileData[editingField]);
      // TODO: Call actual API here
      // await updateCustomerProfile(id, { [editingField]: profileData[editingField] });
    } catch (error) {
      console.error('Failed to save:', error);
      setError('保存に失敗しました。もう一度お試しください。');
    } finally {
      setSaving(false);
      setEditingField(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#68BE6B]"></div>
      </div>
    );
  }

  return (
    <div className="p-8 font-poppins bg-[#FAF8F3] min-h-screen">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">プロフィール</h1>

      {/* エラーメッセージ */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <ExclamationIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-800 font-medium">エラー</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-600 transition-colors"
            aria-label="エラーを閉じる"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <div className="bg-white border border-[#DFDFDF] rounded-[15px] p-8">
        {/* 基本情報セクション */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 pb-2 border-b border-gray-200">
            基本情報
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <EditableField
              label="フリガナ"
              value={profileData.furigana}
              isRequired
              isEditing={editingField === 'furigana'}
              fieldName="furigana"
              onEdit={handleEdit}
              onChange={(value) => handleChange('furigana', value)}
              onBlur={handleBlur}
              icon={<IdentificationIcon className="w-4 h-4" />}
            />
            <EditableField
              label="名前"
              value={profileData.name}
              isRequired
              isEditing={editingField === 'name'}
              fieldName="name"
              onEdit={handleEdit}
              onChange={(value) => handleChange('name', value)}
              onBlur={handleBlur}
              icon={<UserIcon className="w-4 h-4" />}
            />
            <EditableField
              label="性別"
              value={profileData.gender}
              isRequired
              isEditing={editingField === 'gender'}
              fieldName="gender"
              onEdit={handleEdit}
              onChange={(value) => handleChange('gender', value)}
              onBlur={handleBlur}
              type="select"
              options={[
                { value: '男性', label: '男性' },
                { value: '女性', label: '女性' },
                { value: 'その他', label: 'その他' },
              ]}
              icon={<UserIcon className="w-4 h-4" />}
            />
            <EditableField
              label="生年月日"
              value={profileData.birthDate}
              isRequired
              isEditing={editingField === 'birthDate'}
              fieldName="birthDate"
              onEdit={handleEdit}
              onChange={(value) => handleChange('birthDate', value)}
              onBlur={handleBlur}
              type="date"
              icon={<CalendarIcon className="w-4 h-4" />}
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
              icon={<CakeIcon className="w-4 h-4" />}
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
              icon={<ArrowsExpandIcon className="w-4 h-4" />}
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
              icon={<LocationIcon className="w-4 h-4" />}
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
              icon={<MailIcon className="w-4 h-4" />}
            />
          </div>
        </div>

        {/* 医療情報セクション */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 pb-2 border-b border-gray-200">
            医療情報
          </h2>
          <div className="grid grid-cols-1 gap-x-6">
            <EditableField
              label="既往歴"
              value={profileData.medicalHistory}
              isEditing={editingField === 'medicalHistory'}
              fieldName="medicalHistory"
              onEdit={handleEdit}
              onChange={(value) => handleChange('medicalHistory', value)}
              onBlur={handleBlur}
              type="textarea"
              icon={<DocumentIcon className="w-4 h-4" />}
            />
            <EditableField
              label="禁忌"
              value={profileData.contraindications}
              isEditing={editingField === 'contraindications'}
              fieldName="contraindications"
              onEdit={handleEdit}
              onChange={(value) => handleChange('contraindications', value)}
              onBlur={handleBlur}
              type="textarea"
              icon={<ExclamationIcon className="w-4 h-4" />}
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
            icon={<AnnotationIcon className="w-4 h-4" />}
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
