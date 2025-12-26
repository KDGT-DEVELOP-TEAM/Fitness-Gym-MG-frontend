import axiosInstance from '../axiosConfig';

export interface AdminHomeResponse {
  // 実際のレスポンス型に合わせて定義
  [key: string]: any;
}

export const adminHomeApi = {
  getHome: (): Promise<AdminHomeResponse> =>
    axiosInstance.get<AdminHomeResponse>('/api/admin/home').then(res => res.data),
};