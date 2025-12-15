import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  const errorMessage =
    'Supabase environment variables are not set. Please configure REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY.';

  if (isDevelopment) {
    // In development, throw an error to prevent silent failures
    throw new Error(errorMessage);
  } else if (isProduction) {
    // In production, throw an error immediately to prevent security issues
    // Graceful degradation is not acceptable in production for critical infrastructure
    throw new Error(
      `${errorMessage} Application cannot start without proper configuration.`
    );
  } else {
    // In other environments (test, etc.), warn only
    logger.warn(errorMessage, undefined, 'supabase');
  }
}

export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

// Note: Use requireSupabase() from './supabaseHelpers' to get Supabase client with validation
