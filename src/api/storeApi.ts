import axiosInstance from './axiosConfig';
import { Store } from '../types/store';

/**
 * Store API
 */
export const storeApi = {
  /**
   * 店舗一覧取得
   * GET /api/stores
   * レスポンス: Store[]
   */
  getStores: (): Promise<Store[]> =>
    axiosInstance.get<Store[]>('/stores').then(res => res.data),
};