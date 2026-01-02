import axiosInstance from '../axiosConfig';
import { ManagerHomeResponse } from '../../types/manager/home';

export const managerHomeApi = {
  getHome: (storeId: string): Promise<ManagerHomeResponse> =>
    axiosInstance.get<ManagerHomeResponse>(`/stores/${storeId}/manager/home`).then(res => res.data),
};