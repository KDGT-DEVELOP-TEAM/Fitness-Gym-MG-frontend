import axiosInstance from '../axiosConfig';
import { Customer } from '../../types/customer';

// export interface Customer {
//   id: string;
//   name: string;
//   email: string;
//   phone: string;
//   shopId: string;
//   createdAt: string;
// }

export const trainerCustomersApi = {
  getCustomers: (storeId: string): Promise<Customer[]> =>
    axiosInstance.get<Customer[]>(`/api/stores/${storeId}/trainers/customers`).then(res => res.data),
};
