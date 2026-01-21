export const ROUTES = {
  LOGIN: '/login',
  CUSTOMER_SELECT: '/home',
  LESSON_FORM: '/lessons/new',
  LESSON_FORM_WITH_CUSTOMER: '/trainer/newlessons/:customerId',
  // レッスン履歴一覧（ロールごと）
  LESSON_HISTORY_TRAINER: '/trainer/history/:customerId',
  LESSON_HISTORY_ADMIN: '/admin/history/:customerId',
  LESSON_HISTORY_MANAGER: '/manager/history/:customerId',
  // 姿勢一覧（ロールごと）
  POSTURE_LIST_TRAINER: '/trainer/postures/:customerId',
  POSTURE_LIST_ADMIN: '/admin/postures/:customerId',
  POSTURE_LIST_MANAGER: '/manager/postures/:customerId',
  // 顧客プロフィール（ロールごと）
  CUSTOMER_PROFILE_ADMIN: '/admin/profile/:customerId',
  CUSTOMER_PROFILE_MANAGER: '/manager/profile/:customerId',
  CUSTOMER_PROFILE_TRAINER: '/trainer/profile/:customerId',
  // ===== 非推奨ルート（互換性のため残す） =====
  // 注意: 以下のルートは非推奨です。新しいコードでは使用しないでください。
  // 将来的な削除を検討中です。使用箇所を確認し、ロール別ルートへの移行を推奨します。
  /**
   * @deprecated ロール別ルート（LESSON_HISTORY_TRAINER, LESSON_HISTORY_ADMIN, LESSON_HISTORY_MANAGER）を使用してください
   * 使用箇所: AppRouter.tsx
   */
  LESSON_HISTORY: '/trainer/history/:customerId',
  /**
   * @deprecated ロール別ルート（POSTURE_LIST_TRAINER, POSTURE_LIST_ADMIN, POSTURE_LIST_MANAGER）を使用してください
   * 使用箇所: AppRouter.tsx, LessonCreate.tsx
   */
  POSTURE_LIST: '/trainer/postures/:customerId',
  /**
   * @deprecated ロール別ルート（CUSTOMER_PROFILE_ADMIN, CUSTOMER_PROFILE_MANAGER, CUSTOMER_PROFILE_TRAINER）を使用してください
   * 使用箇所: AppRouter.tsx
   */
  CUSTOMER_PROFILE: '/customers/:id',
  POSTURE_COMPARE: '/postures/compare',
  CUSTOMER_MANAGEMENT: '/customers',
  CUSTOMER_LIST: '/customers/list',
  USER_MANAGEMENT: '/users',
  USER_LIST: '/users/list',
  
  // 監査ログ
  AUDIT_LOG_ADMIN: '/admin/logs',

  // レッスン詳細（統一ルート）
  LESSON_DETAIL: '/lesson/:lessonId',

} as const;

