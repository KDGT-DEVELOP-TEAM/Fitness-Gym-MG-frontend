/**
 * Supabase関連のヘルパー関数
 * APIファイルで使用する共通処理を提供
 */

import { supabase } from './supabase';

/**
 * Supabaseが設定されていることを確認し、クライアントを返す
 * 未設定の場合はエラーを投げる
 * 
 * @returns Supabaseクライアント
 * @throws Error if Supabase is not configured
 */
export const requireSupabase = () => {
  if (!supabase) {
    throw new Error('Supabase未設定');
  }
  return supabase;
};

/**
 * Supabaseが設定されているかどうかを確認
 * 
 * @returns Supabaseが設定されている場合はtrue
 */
export const isSupabaseConfigured = (): boolean => {
  return supabase !== null;
};
