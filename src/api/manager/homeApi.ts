import axiosInstance from '../axiosConfig';

export interface ManagerHomeResponse {
  // 実際のレスポンス型に合わせて定義
  [key: string]: any;
}

export const managerHomeApi = {
  getHome: (storeId: string): Promise<ManagerHomeResponse> =>
    axiosInstance.get<ManagerHomeResponse>(`/api/stores/${storeId}/manager/home`).then(res => res.data),
};