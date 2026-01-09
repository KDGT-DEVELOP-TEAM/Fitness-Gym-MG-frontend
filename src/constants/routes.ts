export const ROUTES = {
  LOGIN: '/login',
  CUSTOMER_SELECT: '/home',
  LESSON_FORM: '/lessons/new',
  LESSON_FORM_WITH_CUSTOMER: '/trainer/newlessons/:customerId',
  LESSON_HISTORY: '/trainer/history/:customerId',
  CUSTOMER_PROFILE: '/customers/:id',
  POSTURE_LIST: '/trainer/postures/:customerId',
  POSTURE_COMPARE: '/postures/compare',
  CUSTOMER_MANAGEMENT: '/customers',
  CUSTOMER_LIST: '/customers/list',
  USER_MANAGEMENT: '/users',
  USER_LIST: '/users/list',
} as const;

