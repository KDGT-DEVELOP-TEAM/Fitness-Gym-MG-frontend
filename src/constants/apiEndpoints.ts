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
    BY_CUSTOMER: (customerId: string) => `/customers/${customerId}/lessons`,
    BY_CUSTOMER_CREATE: (customerId: string) => `/customers/${customerId}/lessons`,
    NEXT_BY_TRAINER: (trainerId: string) => `/lessons/next-by-trainer/${trainerId}`,
  },
  POSTURES: {
    BASE: '/postures',
    BY_ID: (id: string) => `/postures/${id}`,
    BY_CUSTOMER: (customerId: string) => `/postures/customer/${customerId}`,
    COMPARE: '/postures/compare',
  },
  POSTURE_GROUPS: {
    BY_CUSTOMER: (customerId: string) => `/customers/${customerId}/posture_groups`,
    BY_LESSON_CREATE: (lessonId: string) => `/lessons/${lessonId}/posture_groups`,
  },
  POSTURE_IMAGES: {
    UPLOAD: '/posture_images/upload',
    SIGNED_URL: (imageId: string) => `/posture_images/${imageId}/signed-url`,
    BATCH_SIGNED_URLS: '/posture_images/signed-urls',
    BY_ID: (imageId: string) => `/posture_images/${imageId}`,
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