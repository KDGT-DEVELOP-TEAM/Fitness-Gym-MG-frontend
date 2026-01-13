import axiosInstance from '../axiosConfig';
import { Customer } from '../../types/api/customer';

export const trainerCustomersApi = {
  /**
   * トレーナーの担当顧客一覧を取得（storeId不要版）
   * GET /api/trainers/customers
   */
  getCustomers: (): Promise<Customer[]> =>
    axiosInstance.get<Customer[]>(`/trainers/customers`).then(res => res.data),
};
