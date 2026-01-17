import axiosInstance from './axiosConfig';
import { API_ENDPOINTS } from '../constants/apiEndpoints';
import { logger } from '../utils/logger';
import { AxiosError } from 'axios';
import { ErrorResponse } from '../types/api/error';
import { convertPageResponse, PaginatedResponse, SpringPage } from '../utils/pagination';
import {
  PasswordResetRequestCreate,
  PasswordResetRequestResponse,
  PasswordResetApproval,
  PasswordResetRejection,
} from '../types/passwordReset';

export const passwordResetApi = {
  /**
   * パスワードリセットリクエストを送信
   * POST /api/password-reset/request
   * 認証不要
   */
  createRequest: async (
    request: PasswordResetRequestCreate
  ): Promise<PasswordResetRequestResponse> => {
    logger.debug('パスワードリセットリクエストAPI呼び出し開始', undefined, 'passwordResetApi');
    try {
      const response = await axiosInstance.post<PasswordResetRequestResponse>(
        API_ENDPOINTS.PASSWORD_RESET.REQUEST,
        request
      );
      logger.debug('パスワードリセットリクエストAPIレスポンス成功', {
        status: response.status,
      }, 'passwordResetApi');
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      logger.error('パスワードリセットリクエストAPIエラー', {
        message: axiosError.message,
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        data: axiosError.response?.data,
        url: axiosError.config?.url,
        method: axiosError.config?.method,
      }, 'passwordResetApi');
      throw error;
    }
  },

  /**
   * 未処理のパスワードリセットリクエスト一覧を取得（ページネーション対応）
   * GET /api/password-reset/requests
   * ADMIN専用
   */
  getRequests: async (params?: { page?: number; size?: number }): Promise<PaginatedResponse<PasswordResetRequestResponse>> => {
    logger.debug('パスワードリセットリクエスト一覧取得API呼び出し開始', undefined, 'passwordResetApi');
    try {
      // クエリパラメータの構築
      const searchParams = new URLSearchParams();
      if (params?.page !== undefined) searchParams.append('page', params.page.toString());
      if (params?.size !== undefined) searchParams.append('size', params.size.toString());

      const response = await axiosInstance.get<SpringPage<PasswordResetRequestResponse>>(
        `${API_ENDPOINTS.PASSWORD_RESET.REQUESTS}?${searchParams.toString()}`
      );
      
      // Spring形式のレスポンスをフロントエンド形式に変換
      const paginatedResponse = convertPageResponse(response.data);
      
      logger.debug('パスワードリセットリクエスト一覧取得APIレスポンス成功', {
        status: response.status,
        count: paginatedResponse.data.length,
        total: paginatedResponse.total,
      }, 'passwordResetApi');
      return paginatedResponse;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      logger.error('パスワードリセットリクエスト一覧取得APIエラー', {
        message: axiosError.message,
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        data: axiosError.response?.data,
        url: axiosError.config?.url,
        method: axiosError.config?.method,
      }, 'passwordResetApi');
      throw error;
    }
  },

  /**
   * パスワードリセットリクエストを承認
   * POST /api/password-reset/approve
   * ADMIN専用
   */
  approveRequest: async (
    approval: PasswordResetApproval
  ): Promise<void> => {
    logger.debug('パスワードリセットリクエスト承認API呼び出し開始', undefined, 'passwordResetApi');
    try {
      await axiosInstance.post(API_ENDPOINTS.PASSWORD_RESET.APPROVE, approval);
      logger.debug('パスワードリセットリクエスト承認APIレスポンス成功', undefined, 'passwordResetApi');
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      logger.error('パスワードリセットリクエスト承認APIエラー', {
        message: axiosError.message,
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        data: axiosError.response?.data,
        url: axiosError.config?.url,
        method: axiosError.config?.method,
      }, 'passwordResetApi');
      throw error;
    }
  },

  /**
   * パスワードリセットリクエストを拒否
   * POST /api/password-reset/reject
   * ADMIN専用
   */
  rejectRequest: async (
    rejection: PasswordResetRejection
  ): Promise<void> => {
    logger.debug('パスワードリセットリクエスト拒否API呼び出し開始', undefined, 'passwordResetApi');
    try {
      await axiosInstance.post(API_ENDPOINTS.PASSWORD_RESET.REJECT, rejection);
      logger.debug('パスワードリセットリクエスト拒否APIレスポンス成功', undefined, 'passwordResetApi');
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      logger.error('パスワードリセットリクエスト拒否APIエラー', {
        message: axiosError.message,
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        data: axiosError.response?.data,
        url: axiosError.config?.url,
        method: axiosError.config?.method,
      }, 'passwordResetApi');
      throw error;
    }
  },

  /**
   * パスワードリセットリクエストを削除
   * DELETE /api/password-reset/{requestId}
   * ADMIN専用
   */
  deleteRequest: async (requestId: string): Promise<void> => {
    logger.debug('パスワードリセットリクエスト削除API呼び出し開始', undefined, 'passwordResetApi');
    try {
      await axiosInstance.delete(API_ENDPOINTS.PASSWORD_RESET.BY_ID(requestId));
      logger.debug('パスワードリセットリクエスト削除APIレスポンス成功', undefined, 'passwordResetApi');
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      logger.error('パスワードリセットリクエスト削除APIエラー', {
        message: axiosError.message,
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        data: axiosError.response?.data,
        url: axiosError.config?.url,
        method: axiosError.config?.method,
      }, 'passwordResetApi');
      throw error;
    }
  },
};
