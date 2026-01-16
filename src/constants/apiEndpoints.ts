/**
 * APIエンドポイント定数
 * 相対パスのみを定義（axiosConfig.tsのbaseURLと組み合わせて使用）
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
  },
  CUSTOMERS: {
    BASE: '/customers',
    BY_ID: (id: string) => `/customers/${id}`,
  },
  LESSONS: {
    BASE: '/lessons',
    BY_ID: (id: string) => `/lessons/${id}`,
    BY_CUSTOMER: (customerId: string) => `/lessons/customer/${customerId}`,
  },
  POSTURES: {
    BASE: '/postures',
    BY_ID: (id: string) => `/postures/${id}`,
    BY_CUSTOMER: (customerId: string) => `/postures/customer/${customerId}`,
    COMPARE: '/postures/compare',
  },
  USERS: {
    BASE: '/users',
    BY_ID: (id: string) => `/users/${id}`,
  },
  STORES: {
    BASE: '/stores',
    BY_ID: (id: string) => `/stores/${id}`,
  },
} as const;