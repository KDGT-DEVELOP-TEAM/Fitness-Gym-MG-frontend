import axiosInstance from '../axiosConfig';
import { ManagerHomeResponse } from '../../types/manager/home';

export const managerHomeApi = {
  getHome: (
    storeId: string,
    params?: {
      chartType?: 'week' | 'month';
      page?: number;
      size?: number;
    }
  ): Promise<ManagerHomeResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.chartType) queryParams.append('chartType', params.chartType);
    if (params?.page !== undefined) queryParams.append('page', String(params.page));
    if (params?.size !== undefined) queryParams.append('size', String(params.size));
    
    const queryString = queryParams.toString();
    const url = queryString 
      ? `/stores/${storeId}/manager/home?${queryString}` 
      : `/stores/${storeId}/manager/home`;
    
    return axiosInstance.get<ManagerHomeResponse>(url).then(res => res.data);
  },
};