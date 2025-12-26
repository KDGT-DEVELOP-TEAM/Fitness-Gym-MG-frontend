import axiosInstance from './axiosConfig';

export interface Store {
  id: string;
  name: string;
}

export const storeApi = {
  // 全店舗取得用のエンドポイント (Java側のパスに合わせて調整してください)
  getStores: (): Promise<Store[]> =>
    axiosInstance.get<Store[]>('/api/stores').then(res => res.data),
};