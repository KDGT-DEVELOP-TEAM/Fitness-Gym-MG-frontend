import axiosInstance from '../axiosConfig';
import { Customer, CustomerListParams } from '../../types/api/customer';
import { convertPageResponse, PaginatedResponse, SpringPage } from '../../utils/pagination';

export const trainerCustomersApi = {
  /**
   * トレーナーの担当顧客一覧を取得（storeId不要版）
   * GET /api/trainers/customers
   * 
   * @param params - ページネーションパラメータ（オプショナル）
   * バックエンドがページネーションをサポートするまで、paramsが指定されていない場合は全件取得を返す
   * バックエンド対応後は、paramsが指定されている場合はページネーション版を使用
   * 
   * @returns ページネーションパラメータが指定されている場合はPaginatedResponse、それ以外はCustomer[]
   */
  getCustomers: (params?: CustomerListParams): Promise<PaginatedResponse<Customer> | Customer[]> => {
    // バックエンドがページネーションをサポートするまで、paramsが指定されていない場合は全件取得
    if (!params) {
      return axiosInstance.get<Customer[]>(`/trainers/customers`).then(res => res.data);
    }
    
    // バックエンドがページネーションをサポートしたらこちらを使用
    // 現時点ではバックエンドが未対応のため、このコードは将来の実装用
    const query = new URLSearchParams();
    if (params.page !== undefined) query.append('page', String(params.page));
    if (params.size !== undefined) query.append('size', String(params.size));
    if (params.name) query.append('name', params.name);
    if (params.sort) query.append('sort', params.sort);
    
    // バックエンドがページネーションをサポートするまで、全件取得を返す
    // バックエンド対応後は以下のコメントを解除して使用
    // return axiosInstance.get<SpringPage<Customer>>(`/trainers/customers?${query}`)
    //   .then(res => convertPageResponse(res.data));
    
    // 暫定対応: paramsが指定されていても全件取得を返す（後方互換性のため）
    return axiosInstance.get<Customer[]>(`/trainers/customers`).then(res => res.data);
  },
};
