import axiosInstance from '../axiosConfig';
import { convertPageResponse, PaginatedResponse, SpringPage } from '../../utils/pagination';

export interface LogParams {
  page?: number;
  size?: number;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  timestamp: string;
  // その他のフィールド
  [key: string]: any;
}

export const adminLogsApi = {
  getLogs: (params?: LogParams): Promise<PaginatedResponse<AuditLog>> => {
    const queryString = new URLSearchParams(params as any).toString();
    return axiosInstance.get<SpringPage<AuditLog>>(`/api/admin/logs?${queryString}`)
      .then(res => convertPageResponse(res.data));
  },
};