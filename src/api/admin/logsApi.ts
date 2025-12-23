import { apiClient } from '../client';

export interface LogParams {
  page?: number;
  size?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export const adminLogsApi = {
  getLogs: (params?: LogParams): Promise<PaginatedResponse<any>> => {
    const queryString = new URLSearchParams(params as any).toString();
    return apiClient.get(`/api/admin/logs?${queryString}`);
  },
};
