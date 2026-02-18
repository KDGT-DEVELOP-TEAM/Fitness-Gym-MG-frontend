import { UserRole } from '../types/api/user';
import { User } from '../types/auth';

/**
 * ユーザーのロールを正規化して取得（大文字に変換）
 * 
 * @param user - ユーザー情報
 * @returns 正規化されたロール、取得できない場合はnull
 */
export const getUserRole = (user: User | null): UserRole | null => {
  if (!user?.role) {
    return null;
  }
  return user.role.toUpperCase() as UserRole;
};

/**
 * ユーザーがADMINロールかどうかを判定
 * 
 * @param user - ユーザー情報
 * @returns ADMINロールの場合true
 */
export const isAdmin = (user: User | null): boolean => {
  return getUserRole(user) === 'ADMIN';
};

/**
 * ユーザーがMANAGERロールかどうかを判定
 * 
 * @param user - ユーザー情報
 * @returns MANAGERロールの場合true
 */
export const isManager = (user: User | null): boolean => {
  return getUserRole(user) === 'MANAGER';
};

/**
 * ユーザーがTRAINERロールかどうかを判定
 * 
 * @param user - ユーザー情報
 * @returns TRAINERロールの場合true
 */
export const isTrainer = (user: User | null): boolean => {
  return getUserRole(user) === 'TRAINER';
};
