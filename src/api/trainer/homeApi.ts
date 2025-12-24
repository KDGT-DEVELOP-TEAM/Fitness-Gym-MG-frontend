import axiosInstance from '../axiosConfig';

export const trainerHomeApi = {
  getHome: () => axiosInstance.get('/api/trainers/home').then(res => res.data),
};
