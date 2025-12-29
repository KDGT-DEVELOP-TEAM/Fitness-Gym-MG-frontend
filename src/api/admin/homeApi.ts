import axiosInstance from '../axiosConfig';
import { AdminHomeResponse } from '../../types/admin/home';

export const adminHomeApi = {
getHome: (): Promise<AdminHomeResponse> =>
axiosInstance.get('/admin/home')
.then(res => res.data),
};