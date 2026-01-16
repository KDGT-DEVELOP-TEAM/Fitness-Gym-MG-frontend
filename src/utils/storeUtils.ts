import { User } from '../types/auth';
import { Store } from '../types/store';

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
