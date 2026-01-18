import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { customerApi } from '../api/customerApi';
import { postureApi } from '../api/postureApi';
import { Gender, CustomerRequest } from '../types/api/customer';
import { logger } from '../utils/logger';
import { validateDateString, validatePastDate, validatePhoneWithoutHyphens } from '../utils/validators';

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
  const fetchedCustomerIdRef = useRef<string | null>(null);
  const originalValueRef = useRef<string | number | null>(null); // 編集開始時の元の値を保持
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
    if (!customerId) {
      setLoading(false);
      return;
    }

    // 既に取得済みの場合は fetchData を実行しないガード
    if (fetchedCustomerIdRef.current === customerId) {
      return;
    }

    fetchedCustomerIdRef.current = customerId;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // APIから顧客データを取得（customerApi.getProfileを使用）
        const data = await customerApi.getProfile(customerId);

        // デバッグログ: 顧客データを確認
        logger.debug('[useCustomerProfile] Customer data:', {
          customerId,
          firstPostureGroupId: data.firstPostureGroupId
        }, 'useCustomerProfile');

        // 初回姿勢画像を取得
        let postureImages = {
          front: undefined as string | undefined,
          back: undefined as string | undefined,
          left: undefined as string | undefined,
          right: undefined as string | undefined,
        };

        try {
          // 姿勢グループ一覧を取得
          const postureGroups = await postureApi.getPostureGroups(customerId);
          
          // デバッグログ: 姿勢グループ一覧を確認
          logger.debug('[useCustomerProfile] Posture groups:', {
            groupCount: postureGroups.length,
            groupIds: postureGroups.map(g => g.id),
            firstPostureGroupId: data.firstPostureGroupId
          }, 'useCustomerProfile');
          
          // 画像が存在する姿勢グループのみをフィルタ（最初に姿勢を撮影したレッスンから表示するため）
          const groupsWithImages = postureGroups.filter(
            (group) => group.images && group.images.length > 0
          );

          // ========== 詳細デバッグログ（コンソールに出力） ==========
          console.log('=== [useCustomerProfile] 姿勢グループ調査 ===');
          console.log('全グループ数:', postureGroups.length);
          console.log('全グループの詳細:');
          postureGroups.forEach((g, i) => {
            console.log(`  [${i}] id=${g.id}, lessonStartDate=${g.lessonStartDate}, imageCount=${g.images?.length || 0}`);
          });
          
          console.log('画像ありグループ数:', groupsWithImages.length);
          console.log('画像ありグループの詳細:');
          groupsWithImages.forEach((g, i) => {
            const dateObj = new Date(g.lessonStartDate);
            console.log(`  [${i}] id=${g.id}, lessonStartDate=${g.lessonStartDate}, parsed=${dateObj.toISOString()}, timestamp=${dateObj.getTime()}, imageCount=${g.images?.length || 0}`);
          });

          let firstPostureGroup;
          if (groupsWithImages.length > 0) {
            // 画像がある最も古いレッスンの姿勢グループを検出
            // lessonStartDateで昇順（古い順）にソートして最初の要素を取得
            const sortedGroups = [...groupsWithImages].sort((a, b) => {
              const dateA = new Date(a.lessonStartDate).getTime();
              const dateB = new Date(b.lessonStartDate).getTime();
              console.log(`  比較: ${a.lessonStartDate}(${dateA}) vs ${b.lessonStartDate}(${dateB}) => ${dateA - dateB}`);
              return dateA - dateB; // 昇順（古い順）
            });
            
            console.log('ソート後の順序:');
            sortedGroups.forEach((g, i) => {
              console.log(`  [${i}] lessonStartDate=${g.lessonStartDate}, id=${g.id}`);
            });
            
            firstPostureGroup = sortedGroups[0];
            
            console.log('選択された初回姿勢グループ:', {
              groupId: firstPostureGroup.id,
              lessonStartDate: firstPostureGroup.lessonStartDate,
              imageCount: firstPostureGroup.images?.length
            });
            console.log('=== 調査終了 ===');
          }

          // デバッグログ: 初回姿勢グループを確認
          logger.debug('[useCustomerProfile] First posture group:', {
            found: !!firstPostureGroup,
            groupId: firstPostureGroup?.id,
            imageCount: firstPostureGroup?.images?.length,
            images: firstPostureGroup?.images?.map(img => ({
              id: img.id,
              position: img.position,
              hasSignedUrl: !!img.signedUrl,
              signedUrlLength: img.signedUrl?.length || 0
            }))
          }, 'useCustomerProfile');

          if (firstPostureGroup && firstPostureGroup.images) {
            // 各位置の画像を抽出
            firstPostureGroup.images.forEach((image) => {
              if (image.signedUrl && image.position) {
                const position = image.position.toLowerCase();
                if (position === 'front' && !postureImages.front) {
                  postureImages.front = image.signedUrl;
                } else if (position === 'back' && !postureImages.back) {
                  postureImages.back = image.signedUrl;
                } else if (position === 'left' && !postureImages.left) {
                  postureImages.left = image.signedUrl;
                } else if (position === 'right' && !postureImages.right) {
                  postureImages.right = image.signedUrl;
                }
              }
            });
          }

          // デバッグログ: 抽出された姿勢画像を確認
          logger.debug('[useCustomerProfile] Posture images:', {
            front: !!postureImages.front,
            back: !!postureImages.back,
            left: !!postureImages.left,
            right: !!postureImages.right,
            frontUrlLength: postureImages.front?.length || 0,
            backUrlLength: postureImages.back?.length || 0,
            leftUrlLength: postureImages.left?.length || 0,
            rightUrlLength: postureImages.right?.length || 0
          }, 'useCustomerProfile');
        } catch (postureError) {
          // 姿勢画像の取得に失敗してもプロフィールの表示は続行
          logger.error('[useCustomerProfile] Failed to load posture images:', postureError, 'useCustomerProfile');
          // エラーの詳細をログに記録
          if (postureError instanceof Error) {
            logger.error('[useCustomerProfile] Posture image error details:', {
              message: postureError.message,
              stack: postureError.stack,
              customerId,
              firstPostureGroupId: data.firstPostureGroupId
            }, 'useCustomerProfile');
          }
        }

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
          postureImages,
        });
      } catch (error) {
        console.error('Failed to load profile:', error);
        // 403エラーの場合は論理削除済み顧客のメッセージを表示
        if (axios.isAxiosError(error) && error.response?.status === 403) {
          setError('この顧客は無効化されているため、プロフィールを表示できません。');
        } else {
          setError('プロフィールの読み込みに失敗しました。');
        }
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
    // 編集開始時に元の値を保存（文字列または数値として保存）
    const currentValue = profileData[fieldName];
    if (typeof currentValue === 'string' || typeof currentValue === 'number') {
      originalValueRef.current = currentValue;
    } else {
      originalValueRef.current = null;
    }
    setEditingField(fieldName);
  };

  const handleChange = (fieldName: keyof CustomerProfileData, value: string) => {
    setProfileData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleBlur = async () => {
    if (!editingField) return;

    // 現在の値を取得（文字列として比較）
    const currentValue = profileData[editingField];
    const currentValueStr = typeof currentValue === 'string' || typeof currentValue === 'number' 
      ? String(currentValue) 
      : '';
    const originalValueStr = originalValueRef.current !== null 
      ? String(originalValueRef.current) 
      : '';

    // 値が変更されていない場合は保存処理をスキップ
    if (currentValueStr === originalValueStr) {
      setEditingField(null);
      originalValueRef.current = null;
      return;
    }

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
        // 日付のバリデーション
        if (!validateDateString(profileData.birthdate)) {
          setError('有効な日付を入力してください');
          return;
        }
        if (!validatePastDate(profileData.birthdate)) {
          setError('生年月日は過去の日付である必要があります');
          return;
        }
        requestData.birthday = profileData.birthdate; // birthdateをbirthdayに変換
      } else if (editingField === 'address') {
        requestData.address = profileData.address;
      } else if (editingField === 'email') {
        requestData.email = profileData.email;
      } else if (editingField === 'phone') {
        // 電話番号のバリデーション（ハイフンを含めない）
        if (!validatePhoneWithoutHyphens(profileData.phone)) {
          if (profileData.phone.includes('-')) {
            setError('電話番号にハイフン（-）を含めることはできません');
          } else {
            setError('電話番号は10文字以上15文字以下の数字のみで入力してください');
          }
          return;
        }
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

      logger.debug('Saved:', { field: editingField, value: profileData[editingField] }, 'useCustomerProfile');
    } catch (error) {
      logger.error('Failed to save:', error, 'useCustomerProfile');
      setError('保存に失敗しました。もう一度お試しください。');
    } finally {
      setSaving(false);
      setEditingField(null);
      originalValueRef.current = null;
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
