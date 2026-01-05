import axiosInstance from './axiosConfig';
import { Store } from '../types/store';

/**
 * Store API
 * 注意: バックエンドにStoreApiControllerが存在しないため、
 * このAPIは現在動作しない可能性があります。
 * バックエンド実装が必要です。
 */
export const storeApi = {
  /**
   * 店舗一覧取得
   * GET /api/stores
   * 注意: バックエンドに実装がない可能性があります
   */
  getStores: (): Promise<Store[]> =>
    axiosInstance.get<Store[]>('/stores').then(res => res.data),
};