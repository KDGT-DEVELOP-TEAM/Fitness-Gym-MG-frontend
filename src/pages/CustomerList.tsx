import React, { useEffect, useState, useRef } from 'react';
import { useCustomers } from '../hooks/useCustomer';
import { LoadingSpinner } from '../components/common/TableStatusRows';
import { ErrorDisplay } from '../components/common/ErrorDisplay';
import { useAuth } from '../context/AuthContext';
import { useStores } from '../hooks/useStore';
import { getAccessibleStores, getInitialStoreId } from '../utils/storeUtils';
import { isTrainer } from '../utils/roleUtils';

export const CustomerList: React.FC = () => {
  const { user: authUser } = useAuth();
  const { stores, loading: storesLoading } = useStores();
  const [selectedStoreId, setSelectedStoreId] = useState<string>('');
  
  const userIsTrainer = isTrainer(authUser);
  
  // トレーナーがアクセス可能な店舗のリスト
  const accessibleStores = React.useMemo(() => {
    return getAccessibleStores(authUser, stores);
  }, [authUser, stores]);

  // 初期値の設定（トレーナーの所属店舗）
  useEffect(() => {
    if (storesLoading) return;
    
    if (!selectedStoreId) {
      const initialStoreId = getInitialStoreId(authUser, accessibleStores, false);
      if (initialStoreId && initialStoreId !== 'all') {
        setSelectedStoreId(initialStoreId);
      }
    }
  }, [authUser, stores, storesLoading, accessibleStores, selectedStoreId]);

  const { 
    customers, 
    total, 
    loading, 
    error, 
    searchQuery,
    setSearchQuery,
    refetch 
  } = useCustomers(selectedStoreId);
  
  const refetchRef = useRef(refetch);
  const searchQueryRef = useRef(searchQuery);
  
  useEffect(() => {
    refetchRef.current = refetch;
  }, [refetch]);
  
  useEffect(() => {
    searchQueryRef.current = searchQuery;
  }, [searchQuery]);
  
  // 店舗IDが設定されたらデータを取得
  const lastFetchKeyRef = useRef<string>('');
  useEffect(() => {
    if (storesLoading) return;
    if (!selectedStoreId) return;
    
    const fetchKey = `${selectedStoreId}-${searchQuery}`;
    if (lastFetchKeyRef.current === fetchKey) return;
    
    lastFetchKeyRef.current = fetchKey;
    refetchRef.current(0);
  }, [selectedStoreId, searchQuery, storesLoading]);

  if (loading && !selectedStoreId) return (
    <div className="p-8">
      <LoadingSpinner minHeight="min-h-[300px]" />
      <div className="text-center text-gray-500 mt-4">店舗情報を読み込み中...</div>
    </div>
  );
  
  if (error) {
    const errorMessage = typeof error === 'string' ? error : '不明なエラーが発生しました';
    return <ErrorDisplay error={errorMessage} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* ヘッダー */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">顧客一覧</h1>
          <p className="text-sm text-gray-500 mt-1">
            <span className="font-bold text-green-600">{total}</span> 名の顧客が登録されています
          </p>
        </div>
      </div>

      {/* 検索・フィルタ */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow group">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-400 group-focus-within:text-green-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="顧客名・フリガナで検索..."
            className="w-full h-14 bg-white border-2 border-gray-50 pl-14 pr-6 rounded-2xl focus:border-green-500 focus:ring-0 outline-none transition-all text-gray-700 font-medium shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            maxLength={100}
          />
        </div>
        {/* 店舗選択ドロップダウン（トレーナーロールの場合のみ表示） */}
        {userIsTrainer && (
          <div className="relative group">
          <select 
            className="h-14 pl-6 pr-10 bg-white border-2 border-gray-50 rounded-2xl text-sm font-black text-gray-600 focus:border-green-500 focus:ring-0 outline-none cursor-pointer shadow-sm transition-all hover:border-gray-200 appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
            value={selectedStoreId}
            onChange={(e) => setSelectedStoreId(e.target.value)}
            disabled={storesLoading || accessibleStores.length === 0}
          >
            {storesLoading ? (
              <option value="">店舗を読み込み中...</option>
            ) : accessibleStores.length === 0 ? (
              <option value="">店舗がありません</option>
            ) : (
              <>
                {accessibleStores.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </>
            )}
          </select>
          {/* カスタム矢印アイコン */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"/>
            </svg>
          </div>
          </div>
        )}
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-2xl font-bold text-sm border border-red-100">
          ⚠️ エラーが発生しました: {error}
        </div>
      )}
      
      {/* テーブル */}
      <div className="bg-white rounded-[2rem] shadow-sm border-2 border-gray-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-50">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="w-[30%] px-8 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">氏名</th>
                <th className="w-[35%] px-8 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">メール</th>
                <th className="w-[35%] px-8 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">電話</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-gray-400 italic">
                    登録されている顧客がいません
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id || `temp-key-${Math.random()}`} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-6 text-center">
                      <div className="font-black text-gray-900 text-base">{customer.name}</div>
                    </td>
                    <td className="px-8 py-6 text-center text-gray-600 text-sm">{customer.email || '-'}</td>
                    <td className="px-8 py-6 text-center text-gray-600 text-sm">{customer.phone || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};