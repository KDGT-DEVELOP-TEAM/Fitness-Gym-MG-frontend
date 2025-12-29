import axiosInstance from '../axiosConfig';
import { convertPageResponse, PaginatedResponse, SpringPage } from '../../utils/pagination';
import { AuditLog, LogListParams } from '../../types/admin/log';

export const adminLogsApi = {
  /**
   * システム操作ログの一覧を取得する
   */
  getLogs: async (params?: LogListParams): Promise<PaginatedResponse<AuditLog>> => {
    // 1. クエリパラメータの構築
    const searchParams = new URLSearchParams();
    if (params?.page !== undefined) searchParams.append('page', params.page.toString());
    if (params?.size !== undefined) searchParams.append('size', params.size.toString());

    // 2. APIリクエスト
    const response = await axiosInstance.get<SpringPage<AuditLog>>(
      `/admin/logs?${searchParams.toString()}`
    );

    // 3. Spring形式のレスポンスをフロントエンド用のパギネーション形式に変換
    return convertPageResponse(response.data);
  },
};