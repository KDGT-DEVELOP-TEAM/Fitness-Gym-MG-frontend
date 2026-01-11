import axiosInstance from '../axiosConfig';
import { AdminHomeResponse } from '../../types/admin/home';

export const adminHomeApi = {
  getHome: (params?: {
    storeId?: string;
    chartType?: 'week' | 'month';
    page?: number;
    size?: number;
  }): Promise<AdminHomeResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.storeId) queryParams.append('storeId', params.storeId);
    if (params?.chartType) queryParams.append('chartType', params.chartType);
    if (params?.page !== undefined) queryParams.append('page', String(params.page));
    if (params?.size !== undefined) queryParams.append('size', String(params.size));
    
    const queryString = queryParams.toString();
    const url = queryString ? `/admin/home?${queryString}` : '/admin/home';
    
    return axiosInstance.get<AdminHomeResponse>(url).then(res => res.data);
  },
};