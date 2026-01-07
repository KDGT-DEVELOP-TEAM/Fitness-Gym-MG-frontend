import { User } from '../types/api/user';
import { Customer } from '../types/api/customer';
import { Posture, PostureComparison, PostureAnalysis } from '../types/posture';

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
    typeof c.kana === 'string' &&
    typeof c.email === 'string' &&
    typeof c.phone === 'string' &&
    typeof c.address === 'string' &&
    typeof c.birthdate === 'string' &&
    typeof c.age === 'number' &&
    typeof c.height === 'number' &&
    typeof c.active === 'boolean' &&
    typeof c.createdAt === 'string' &&
    // gender: MALE/FEMALEのいずれかであることを厳密にチェック
    (c.gender === 'MALE' || c.gender === 'FEMALE') &&
    // firstPostureGroupId, latestWeight, medical, taboo, memoはnull許容のためチェックしない
    (c.firstPostureGroupId === null || typeof c.firstPostureGroupId === 'string') &&
    (c.latestWeight === null || typeof c.latestWeight === 'number') &&
    (c.medical === null || typeof c.medical === 'string') &&
    (c.taboo === null || typeof c.taboo === 'string') &&
    (c.memo === null || typeof c.memo === 'string')
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
