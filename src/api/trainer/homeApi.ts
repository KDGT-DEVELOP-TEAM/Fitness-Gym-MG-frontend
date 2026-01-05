import axiosInstance from '../axiosConfig';
import { TrainerHomeResponse } from '../../types/trainer/home';

export const trainerHomeApi = {
  getHome: (params?: {
    page?: number;
    size?: number;
  }): Promise<TrainerHomeResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', String(params.page));
    if (params?.size !== undefined) queryParams.append('size', String(params.size));
    
    const queryString = queryParams.toString();
    const url = queryString ? `/trainers/home?${queryString}` : '/trainers/home';
    
    return axiosInstance.get<TrainerHomeResponse>(url).then(res => res.data);
  },
};