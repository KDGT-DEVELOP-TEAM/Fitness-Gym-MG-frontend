export const ROUTES = {
  LOGIN: '/login',
  CUSTOMER_SELECT: '/home',
  LESSON_FORM: '/lessons/new',
  LESSON_FORM_WITH_CUSTOMER: '/trainer/newlessons/:customerId',
  // レッスン履歴一覧（ロールごと）
  LESSON_HISTORY_TRAINER: '/trainer/history/:customerId',
  LESSON_HISTORY_ADMIN: '/admin/history/:customerId',
  LESSON_HISTORY_MANAGER: '/manager/history/:customerId',
  // 旧パス（互換性のため残す）
  LESSON_HISTORY: '/trainer/history/:customerId',
  // 姿勢一覧（ロールごと）
  POSTURE_LIST_TRAINER: '/trainer/postures/:customerId',
  POSTURE_LIST_ADMIN: '/admin/postures/:customerId',
  POSTURE_LIST_MANAGER: '/manager/postures/:customerId',
  // 旧パス（互換性のため残す）
  POSTURE_LIST: '/trainer/postures/:customerId',
  CUSTOMER_PROFILE: '/customers/:id',
  POSTURE_COMPARE: '/postures/compare',
  CUSTOMER_MANAGEMENT: '/customers',
  CUSTOMER_LIST: '/customers/list',
  USER_MANAGEMENT: '/users',
  USER_LIST: '/users/list',
} as const;

