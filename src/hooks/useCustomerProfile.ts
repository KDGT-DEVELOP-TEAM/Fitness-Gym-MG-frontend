import { useState, useEffect } from 'react';

export interface CustomerProfileData {
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

export const useCustomerProfile = (customerId: string) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<keyof CustomerProfileData | null>(null);
  const [profileData, setProfileData] = useState<CustomerProfileData>({
    id: customerId || '',
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

  // プロフィールデータ取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));
        // TODO: Call actual API here
        // const data = await fetchCustomerProfile(customerId);
        // setProfileData(data);
      } catch (error) {
        console.error('Failed to load profile:', error);
        setError('プロフィールの読み込みに失敗しました。');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [customerId]);

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
      // await updateCustomerProfile(customerId, { [editingField]: profileData[editingField] });
    } catch (error) {
      console.error('Failed to save:', error);
      setError('保存に失敗しました。もう一度お試しください。');
    } finally {
      setSaving(false);
      setEditingField(null);
    }
  };

  const dismissError = () => setError(null);

  return {
    profileData,
    loading,
    saving,
    error,
    editingField,
    handleEdit,
    handleChange,
    handleBlur,
    dismissError,
  };
};
