import { SupabaseUser, SupabaseTraining, SupabasePostureGroup, SupabaseStore, SupabaseCustomer } from '../types/supabase';
import { User } from '../types/user';
import { Customer } from '../types/customer';
import { Posture, PostureComparison, PostureAnalysis } from '../types/posture';

/**
 * Type guard to check if a value is a SupabaseStore
 */
export const isSupabaseStore = (data: unknown): data is SupabaseStore => {
  if (!data || typeof data !== 'object') return false;
  const store = data as Record<string, unknown>;
  return (
    typeof store.id === 'string' &&
    typeof store.name === 'string'
  );
};

/**
 * Type guard to check if a value is a SupabaseUser
 */
export const isSupabaseUser = (user: unknown): user is SupabaseUser => {
  if (!user || typeof user !== 'object') {
    return false;
  }

  const u = user as Record<string, unknown>;
  return (
    typeof u.id === 'string' &&
    typeof u.email === 'string' &&
    'auth_user_id' in u
  );
};

/**
 * Type guard to check if a value is a SupabaseCustomer
 */
export const isSupabaseCustomer = (data: unknown): data is SupabaseCustomer => {
  if (!data || typeof data !== 'object') return false;
  const customer = data as Record<string, unknown>;
  return (
    typeof customer.id === 'string' &&
    typeof customer.name === 'string' &&
    typeof customer.email === 'string' &&
    typeof customer.kana === 'string' &&
    typeof customer.gender === 'string' &&
    typeof customer.birthday === 'string' &&
    typeof customer.height === 'number' &&
    typeof customer.phone === 'string' &&
    typeof customer.address === 'string' &&
    typeof customer.created_at === 'string' &&
    typeof customer.is_active === 'boolean'
  );
};

/**
 * Type guard to check if a value is a User
 */
export const isUser = (user: unknown): user is User => {
  if (!user || typeof user !== 'object') {
    return false;
  }

  const u = user as Record<string, unknown>;
  return (
    typeof u.id === 'string' &&
    typeof u.email === 'string' &&
    typeof u.name === 'string' &&
    typeof u.role === 'string' &&
    ['admin', 'manager', 'trainer'].includes(u.role as string)
  );
};

/**
 * Type guard to check if a value has a specific property
 */
export const hasProperty = <K extends string>(
  obj: unknown,
  prop: K
): obj is Record<K, unknown> => {
  return typeof obj === 'object' && obj !== null && prop in obj;
};

/**
 * Type guard to check if a value is a Customer
 */
export const isCustomer = (customer: unknown): customer is Customer => {
  if (!customer || typeof customer !== 'object') {
    return false;
  }

  const c = customer as Record<string, unknown>;
  return (
    typeof c.id === 'string' &&
    typeof c.name === 'string' &&
    typeof c.email === 'string' && // DBスキーマでNOT NULL
    typeof c.phone === 'string' && // DBスキーマでNOT NULL
    typeof c.shopId === 'string' &&
    typeof c.createdAt === 'string' &&
    // updatedAt: DBスキーマに存在しないため削除
    true
  );
};

/**
 * Type guard to check if a value is an array of Customers
 */
export const isCustomerArray = (customers: unknown): customers is Customer[] => {
  return Array.isArray(customers) && customers.every(isCustomer);
};

/**
 * Type guard to check if a value is an array of Users
 */
export const isUserArray = (users: unknown): users is User[] => {
  return Array.isArray(users) && users.every(isUser);
};

/**
 * Type guard to check if a value is a SupabaseTraining
 */
export const isSupabaseTraining = (data: unknown): data is SupabaseTraining => {
  if (!data || typeof data !== 'object') return false;
  const t = data as Record<string, unknown>;
  return (
    typeof t.lesson_id === 'string' &&
    typeof t.name === 'string' &&
    typeof t.reps === 'number' &&
    typeof t.order_no === 'number'
  );
};

/**
 * Type guard to check if a value is a SupabasePostureGroup
 */
export const isSupabasePostureGroup = (data: unknown): data is SupabasePostureGroup => {
  if (!data || typeof data !== 'object') return false;
  const pg = data as Record<string, unknown>;
  return (
    typeof pg.id === 'string' &&
    typeof pg.customer_id === 'string' &&
    typeof pg.captured_at === 'string' &&
    typeof pg.created_at === 'string'
  );
};

/**
 * Type guard to check if a value is a PostureAnalysis
 */
export const isPostureAnalysis = (data: unknown): data is PostureAnalysis => {
  if (!data || typeof data !== 'object') return false;
  const analysis = data as Record<string, unknown>;
  return (
    (analysis.angles === undefined || typeof analysis.angles === 'object') &&
    (analysis.alignment === undefined || typeof analysis.alignment === 'object') &&
    (analysis.recommendations === undefined || Array.isArray(analysis.recommendations))
  );
};

/**
 * Type guard to check if a value is a Posture
 */
export const isPosture = (data: unknown): data is Posture => {
  if (!data || typeof data !== 'object') return false;
  const posture = data as Record<string, unknown>;
  return (
    typeof posture.id === 'string' &&
    typeof posture.customerId === 'string' &&
    typeof posture.imageUrl === 'string' &&
    typeof posture.createdAt === 'string' &&
    typeof posture.updatedAt === 'string' && // Posture型はDBテーブルに対応しない可能性があるため、現状維持
    (posture.lessonId === undefined || typeof posture.lessonId === 'string') &&
    (posture.analysis === undefined || isPostureAnalysis(posture.analysis))
  );
};

/**
 * Type guard to check if a value is an array of Postures
 */
export const isPostureArray = (data: unknown): data is Posture[] => {
  return Array.isArray(data) && data.every(isPosture);
};

/**
 * Type guard to check if a value is a PostureComparison
 */
export const isPostureComparison = (data: unknown): data is PostureComparison => {
  if (!data || typeof data !== 'object') return false;
  const comparison = data as Record<string, unknown>;
  return (
    isPosture(comparison.before) &&
    isPosture(comparison.after) &&
    (comparison.improvements === undefined || Array.isArray(comparison.improvements))
  );
};
