import { useState, useEffect } from 'react';
import { customerApi } from '../api/customerApi';
import { Gender, CustomerRequest } from '../types/api/customer';

export interface CustomerProfileData {
  id: string;
  kana: string; // バックエンドのCustomer.kanaに対応
  name: string;
  gender: Gender | ''; // バックエンドのGender Enum（MALE/FEMALE）に対応
  birthdate: string; // バックエンドのCustomer.birthdateに対応
  age: number;
  height: string;
  address: string;
  email: string;
  phone: string; // バックエンドのCustomer.phoneに対応
  medical: string; // バックエンドのCustomer.medicalに対応
  taboo: string; // バックエンドのCustomer.tabooに対応
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
    kana: '',
    name: '',
    gender: '',
    birthdate: '',
    age: 0,
    height: '',
    address: '',
    email: '',
    phone: '',
    medical: '',
    taboo: '',
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

        // APIから顧客データを取得（customerApi.getProfileを使用）
        const data = await customerApi.getProfile(customerId);

        // 取得したデータをプロフィール形式に変換
        setProfileData({
          id: data.id,
          kana: data.kana || '',
          name: data.name,
          gender: data.gender || '',
          birthdate: data.birthdate || '',
          age: data.birthdate ? calculateAge(data.birthdate) : 0,
          height: data.height?.toString() || '',
          address: data.address || '',
          email: data.email || '',
          phone: data.phone || '',
          medical: data.medical || '',
          taboo: data.taboo || '',
          memo: data.memo || '',
          postureImages: {
            front: undefined,
            back: undefined,
            left: undefined,
            right: undefined,
          },
        });
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
    if (profileData.birthdate) {
      const newAge = calculateAge(profileData.birthdate);
      setProfileData((prev) => ({ ...prev, age: newAge }));
    }
  }, [profileData.birthdate]);

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

      // CustomerRequestに合わせてデータを構築
      const requestData: Partial<CustomerRequest> = {};
      
      if (editingField === 'height') {
        const heightNum = parseFloat(profileData.height);
        requestData.height = isNaN(heightNum) ? undefined : heightNum;
      } else if (editingField === 'kana') {
        requestData.kana = profileData.kana;
      } else if (editingField === 'name') {
        requestData.name = profileData.name;
      } else if (editingField === 'gender') {
        requestData.gender = profileData.gender as Gender;
      } else if (editingField === 'birthdate') {
        requestData.birthday = profileData.birthdate; // birthdateをbirthdayに変換
      } else if (editingField === 'address') {
        requestData.address = profileData.address;
      } else if (editingField === 'email') {
        requestData.email = profileData.email;
      } else if (editingField === 'phone') {
        requestData.phone = profileData.phone;
      } else if (editingField === 'medical') {
        requestData.medical = profileData.medical;
      } else if (editingField === 'taboo') {
        requestData.taboo = profileData.taboo;
      } else if (editingField === 'memo') {
        requestData.memo = profileData.memo;
      }

      // customerApi.updateProfileを使用
      await customerApi.updateProfile(customerId, requestData as CustomerRequest);

      console.log('Saved:', editingField, profileData[editingField]);
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
