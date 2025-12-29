import axiosInstance from './axiosConfig';
import { Store } from '../types/store';

export const storeApi = {
  getStores: (): Promise<Store[]> =>
    axiosInstance.get<Store[]>('/stores').then(res => res.data),
};