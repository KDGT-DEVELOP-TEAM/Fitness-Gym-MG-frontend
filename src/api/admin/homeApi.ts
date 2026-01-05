import axiosInstance from '../axiosConfig';
import { AdminHomeResponse } from '../../types/admin/home';

export const adminHomeApi = {
  getHome: (): Promise<AdminHomeResponse> =>
    axiosInstance.get<AdminHomeResponse>('/admin/home').then(res => res.data),
};