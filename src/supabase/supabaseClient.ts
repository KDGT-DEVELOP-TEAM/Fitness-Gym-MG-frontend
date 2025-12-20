import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase URLまたはAnon Keyが環境変数に設定されていません。'
  );
}

// Supabaseクライアントを初期化
export const supabase = createClient(supabaseUrl, supabaseAnonKey);