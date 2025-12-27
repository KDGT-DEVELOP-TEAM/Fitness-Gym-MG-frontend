import axiosInstance from '../axiosConfig';
import { convertPageResponse, PaginatedResponse, SpringPage } from '../../utils/pagination';

export interface LogParams {
  page?: number;
  size?: number;
}

export const adminLogsApi = {
  getLogs: (params?: LogParams): Promise<PaginatedResponse<any>> => {
    const queryString = new URLSearchParams(params as any).toString();
    return axiosInstance.get<SpringPage<any>>(`/api/admin/logs?${queryString}`)
      .then(res => convertPageResponse(res.data));
  },
};
