/**
 * Supabase database table type definitions
 * Based on the database schema from README.md
 */

// Enums
export type UserRole = 'admin' | 'manager' | 'trainer';
export type Gender = 'male' | 'female' | 'other';
export type PostureImagePosition = 'front' | 'right' | 'back' | 'left';

// Stores table
export interface SupabaseStore {
  id: string;
  name: string;
}

// Users table (with auth_user_id for Supabase Auth integration)
// Note: pass field (hashed password) is not included as it should not be handled in frontend
export interface SupabaseUser {
  id: string;
  auth_user_id?: string | null; // FK to Supabase Auth users
  email: string;
  kana: string;
  name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  // updated_at: DBスキーマに存在しないため削除
}

// Customers table
export interface SupabaseCustomer {
  id: string;
  kana: string;
  name: string;
  gender: Gender;
  birthday: string; // date format
  height: number;
  email: string;
  phone: string;
  address: string;
  medical?: string | null;
  taboo?: string | null;
  first_posture_group_id?: string | null;
  memo?: string | null;
  created_at: string;
  is_active: boolean;
}

// Lessons table
export interface SupabaseLesson {
  id: string;
  store_id: string;
  user_id: string;
  customer_id: string;
  posture_group_id?: string | null;
  condition?: string | null;
  weight?: number | null;
  meal?: string | null;
  memo?: string | null;
  start_date?: string | null; // timestamptz
  end_date?: string | null; // timestamptz
  next_date?: string | null; // timestamptz
  next_store_id?: string | null;
  next_user_id?: string | null;
  created_at: string;
}

// Trainings table
export interface SupabaseTraining {
  lesson_id: string;
  order_no: number;
  name: string;
  reps: number;
}

// Posture groups table
// Note: README.mdではlesson_idがNOT NULLだが、実際の使用ではレッスン作成前に姿勢グループを作成する場合がある
// そのため、DBスキーマと実際の使用が不一致の可能性がある
export interface SupabasePostureGroup {
  id: string;
  customer_id: string;
  lesson_id: string; // README.mdではNOT NULL（ただし、実際の使用ではnullが必要な場合がある可能性）
  captured_at: string; // timestamptz
  created_at: string;
}

// Posture images table
export interface SupabasePostureImage {
  id: string;
  posture_group_id: string;
  storage_key: string;
  consent_publication: boolean;
  taken_at: string; // timestamptz
  created_at: string;
  position: PostureImagePosition;
}

// Junction tables
export interface SupabaseStoreCustomer {
  store_id: string;
  customer_id: string;
}

export interface SupabaseUserStore {
  user_id: string;
  store_id: string;
}

export interface SupabaseUserCustomer {
  user_id: string;
  customer_id: string;
}

// Type guards are defined in utils/typeGuards.ts to avoid duplication
// Import from utils/typeGuards.ts when type guards are needed
