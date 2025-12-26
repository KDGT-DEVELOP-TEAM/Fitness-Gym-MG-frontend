import axiosInstance from '../axiosConfig';

export interface TrainerHomeResponse {
  // 実際のレスポンス型に合わせて定義
  [key: string]: any;
}

export const trainerHomeApi = {
  getHome: (): Promise<TrainerHomeResponse> =>
    axiosInstance.get<TrainerHomeResponse>('/api/trainers/home').then(res => res.data),
};