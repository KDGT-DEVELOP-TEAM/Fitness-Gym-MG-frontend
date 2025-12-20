import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../supabase/supabaseClient';
import { Customer } from '../types/customer';

export type CustomerFormData = Omit<Customer, 'id' | 'createdAt'>;

export const useCustomers = () => {
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // --- ヘルパー: 性別の変換 ---
  const formatGenderForDB = (gender: string) => {
    const genderMap: Record<string, string> = {
      'male': '男',
      'female': '女',
      'other': 'その他'
    };
    return genderMap[gender] || gender;
  };

  // --- ヘルパー: 年齢計算 (追加) ---
  const calculateAge = useCallback((birthday: string) => {
    if (!birthday) return 0;
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }, []);

  // --- 1. データ取得 ---
  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAllCustomers(data.map((c: any) => ({
        id: c.id,
        kana: c.kana,
        name: c.name,
        gender: c.gender,
        birthday: c.birthday,
        height: c.height,
        email: c.email,
        phone: c.phone,
        address: c.address,
        medical: c.medical,
        taboo: c.taboo,
        firstPostureGroupId: c.first_posture_group_id, // キャメルケースに統一
        memo: c.memo,
        createdAt: c.created_at,
        isActive: c.is_active,
      })));
    } catch (err: any) {
      setError(`取得失敗: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  // --- 2. 新規作成 ---
  const createCustomer = async (formData: CustomerFormData) => {
    setLoading(true);
    try {
      const { error: insertError } = await supabase
        .from('customers')
        .insert([{
          name: formData.name,
          kana: formData.kana,
          gender: formatGenderForDB(formData.gender),
          birthday: formData.birthday,
          height: formData.height,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          medical: formData.medical,
          taboo: formData.taboo,
          is_active: formData.isActive,
          memo: formData.memo,
          first_posture_group_id: formData.firstPostureGroupId // DB名に変換
        }]);

      if (insertError) throw insertError;
      await fetchCustomers();
    } catch (err: any) {
      setError(`登録失敗: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // --- 3. 更新 ---
  const updateCustomer = async (formData: CustomerFormData, customerId: string) => {
    setLoading(true);
    try {
      const { data, error: updateError } = await supabase
        .from('customers')
        .update({
          name: formData.name,
          kana: formData.kana,
          gender: formatGenderForDB(formData.gender),
          birthday: formData.birthday,
          height: formData.height,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          medical: formData.medical,
          taboo: formData.taboo,
          is_active: formData.isActive,
          memo: formData.memo,
          first_posture_group_id: formData.firstPostureGroupId
        })
        .eq('id', customerId)
        .select();

      if (updateError) throw updateError;
      await fetchCustomers();
    } catch (err: any) {
      setError(`更新失敗: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // --- 4. 削除 ---
  const deleteCustomer = async (customerId: string) => {
    setLoading(true);
    try {
      const { error: deleteError } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId);

      if (deleteError) throw deleteError;
      await fetchCustomers();
    } catch (err: any) {
      setError(`削除失敗: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const filteredCustomers = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return allCustomers.filter(c => 
      c.name.toLowerCase().includes(query) || 
      (c.kana && c.kana.toLowerCase().includes(query))
    );
  }, [allCustomers, searchQuery]);

  return {
    customers: filteredCustomers,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    calculateAge, 
    refetch: fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
  };
};