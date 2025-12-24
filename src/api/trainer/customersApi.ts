import axiosInstance from '../axiosConfig';

export const trainerCustomersApi = {
  getCustomers: (storeId: string): Promise<any[]> =>
    axiosInstance.get(`/api/stores/${storeId}/trainers/customers`).then(res => res.data),
};
