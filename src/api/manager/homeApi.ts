import axiosInstance from '../axiosConfig';

export const managerHomeApi = {
  getHome: (storeId: string) => 
    axiosInstance.get(`/api/stores/${storeId}/manager/home`).then(res => res.data),
};
