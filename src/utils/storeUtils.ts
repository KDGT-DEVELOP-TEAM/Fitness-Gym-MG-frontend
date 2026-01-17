import { User } from '../types/auth';
import { Store } from '../types/store';
import { isAdmin, isManager, isTrainer } from './roleUtils';

/**
 * Managerロールのユーザー向けにstoreIdを取得する
 * 
 * @param authUser - 認証済みユーザー情報
 * @param selectedStoreId - 選択された店舗ID（オプショナル）
 * @param stores - 店舗一覧（オプショナル）
 * @returns 店舗ID、取得できない場合はnull
 */
export const getStoreIdForManager = (
  authUser: User | null,
  selectedStoreId?: string,
  stores?: Store[]
): string | null => {
  // 選択された店舗IDが指定されている場合はそれを使用
  if (selectedStoreId) {
    return selectedStoreId;
  }
  
  // ユーザーのstoreIdsから最初のIDを取得
  if (Array.isArray(authUser?.storeIds) && authUser.storeIds.length > 0) {
    return authUser.storeIds[0];
  }
  
  // 店舗一覧から最初のIDを取得
  if (stores && stores.length > 0) {
    return stores[0].id;
  }
  
  return null;
};

/**
 * Managerロールのユーザー向けにstoreIdを取得し、取得できない場合はエラーをスロー
 * 
 * @param authUser - 認証済みユーザー情報
 * @param selectedStoreId - 選択された店舗ID（オプショナル）
 * @param stores - 店舗一覧（オプショナル）
 * @returns 店舗ID
 * @throws 店舗IDが取得できない場合
 */
export const getStoreIdForManagerOrThrow = (
  authUser: User | null,
  selectedStoreId?: string,
  stores?: Store[]
): string => {
  const storeId = getStoreIdForManager(authUser, selectedStoreId, stores);
  if (!storeId) {
    throw new Error('店舗IDが取得できませんでした');
  }
  return storeId;
};

/**
 * Get list of stores accessible by the user based on their role
 * 
 * @param authUser - Authenticated user
 * @param stores - List of all stores
 * @returns List of accessible stores
 */
export const getAccessibleStores = (
  authUser: User | null,
  stores: Store[]
): Store[] => {
  if (!stores || stores.length === 0) return [];
  
  // ADMIN, MANAGER, and TRAINER can access all stores
  if (isAdmin(authUser) || isManager(authUser) || isTrainer(authUser)) {
    return stores;
  }
  
  // Other roles can only access their assigned stores
  if (!authUser?.storeIds) return stores;
  const userStoreIds = Array.isArray(authUser.storeIds) 
    ? authUser.storeIds 
    : [authUser.storeIds];
  return stores.filter(store => userStoreIds.includes(store.id));
};

/**
 * Get initial storeId for manager/admin users
 * Priority: 1) User's assigned store, 2) First accessible store, 3) 'all' for admin
 * 
 * @param authUser - Authenticated user
 * @param accessibleStores - List of accessible stores
 * @param isAdminUser - Whether user is admin (for 'all' option)
 * @returns Initial storeId ('all' for admin, storeId for manager, or empty string)
 */
export const getInitialStoreId = (
  authUser: User | null,
  accessibleStores: Store[],
  isAdminUser: boolean = false
): 'all' | string => {
  if (isAdminUser) {
    return 'all';
  }
  
  // Priority 1: User's assigned store
  if (authUser?.storeIds && authUser.storeIds.length > 0) {
    const userStoreId = Array.isArray(authUser.storeIds) 
      ? authUser.storeIds[0] 
      : authUser.storeIds;
    
    // Verify the store is in accessible stores
    if (accessibleStores.some(s => s.id === userStoreId)) {
      return userStoreId;
    }
  }
  
  // Priority 2: First accessible store
  if (accessibleStores.length > 0) {
    return accessibleStores[0].id;
  }
  
  return '';
};
