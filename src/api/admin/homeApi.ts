import axiosInstance from '../axiosConfig';

export const adminHomeApi = {
  getHome: () => axiosInstance.get('/api/admin/home').then(res => res.data),
};
