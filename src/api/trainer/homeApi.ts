import axiosInstance from '../axiosConfig';
import { HomeResponse } from '../../types/admin/home';

/**
 * Trainer用ホームAPI
 * バックエンド: GET /api/trainers/home
 * 
 * 1週間後～1ヶ月後までのレッスン予定をページネーション付きで取得
 */
export const trainerHomeApi = {
  /**
   * トレーナーホームデータ取得
   * GET /api/trainers/home
   * 
   * @param params ページネーション用パラメータ
   * @param params.page ページ番号（0ベース、デフォルト: 0）
   * @param params.size 1ページあたりの件数（デフォルト: 10）
   * @returns HomeResponse（upcomingLessonsとtotalLessonCountを含む）
   */
  getHome: (params?: {
    page?: number;
    size?: number;
  }): Promise<HomeResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', String(params.page));
    if (params?.size !== undefined) queryParams.append('size', String(params.size));
    
    const queryString = queryParams.toString();
    const url = queryString 
      ? `/trainers/home?${queryString}` 
      : '/trainers/home';
    
    return axiosInstance.get<HomeResponse>(url).then(res => res.data);
  },
};

