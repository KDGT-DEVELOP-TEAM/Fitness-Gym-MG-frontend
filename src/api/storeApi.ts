import axiosInstance from './axiosConfig';
import { Store } from '../types/store';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

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
    axiosInstance.get<Store[]>(API_ENDPOINTS.STORES.BASE).then(res => res.data),
};