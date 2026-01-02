import axiosInstance from '../axiosConfig';
import { TrainerHomeResponse } from '../../types/trainer/home';

export const trainerHomeApi = {
  getHome: (): Promise<TrainerHomeResponse> =>
    axiosInstance.get<TrainerHomeResponse>('/trainers/home').then(res => res.data),
};