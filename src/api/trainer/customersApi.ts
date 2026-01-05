import axiosInstance from '../axiosConfig';
import { Customer } from '../../types/api/customer';

export const trainerCustomersApi = {
  getCustomers: (storeId: string): Promise<Customer[]> =>
    axiosInstance.get<Customer[]>(`/stores/${storeId}/trainers/customers`).then(res => res.data),
};
