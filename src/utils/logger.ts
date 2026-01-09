/**
 * Logger utility for application-wide logging
 * Supports different log levels and environment-based filtering
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

const isProduction = process.env.NODE_ENV === 'production';

// Minimum log level based on environment
const minLogLevel = isProduction ? LogLevel.INFO : LogLevel.DEBUG;

/**
 * Check if a log level should be output
 */
function shouldLog(level: LogLevel): boolean {
  return level >= minLogLevel;
}

/**
 * Mask sensitive information from error objects
 * Uses WeakSet to prevent infinite recursion from circular references
 */
function maskSensitiveData(data: unknown, seen = new WeakSet()): unknown {
  if (!data || typeof data !== 'object') {
    return data;
  }

  // 循環参照を検出
  if (seen.has(data as object)) {
    return '[Circular]';
  }
  seen.add(data as object);

  try {
    const masked = { ...(data as Record<string, unknown>) };
    const sensitiveKeys = ['token', 'password', 'pass', 'access_token', 'refresh_token', 'authorization'];

    for (const key of Object.keys(masked)) {
      const lowerKey = key.toLowerCase();
      if (sensitiveKeys.some(sk => lowerKey.includes(sk))) {
        masked[key] = '***MASKED***';
      } else if (typeof masked[key] === 'object' && masked[key] !== null) {
        masked[key] = maskSensitiveData(masked[key], seen);
      }
    }

    return masked;
  } catch (e) {
    // オブジェクトの処理中にエラーが発生した場合（例: getterが例外をスロー）
    return `[Error masking data: ${e instanceof Error ? e.message : String(e)}]`;
  } finally {
    seen.delete(data as object);
  }
}

/**
 * Format log message with timestamp and context
 */
function formatMessage(level: string, message: string, context?: string): string {
  const timestamp = new Date().toISOString();
  const contextStr = context ? `[${context}]` : '';
  return `${timestamp} ${level} ${contextStr} ${message}`;
}

export const logger = {
  /**
   * Debug log (only in development)
   */
  debug: (message: string, data?: unknown, context?: string): void => {
    if (shouldLog(LogLevel.DEBUG)) {
      const formatted = formatMessage('DEBUG', message, context);
      if (data !== undefined) {
        console.debug(formatted, data);
      } else {
        console.debug(formatted);
      }
    }
  },

  /**
   * Info log
   */
  info: (message: string, data?: unknown, context?: string): void => {
    if (shouldLog(LogLevel.INFO)) {
      const formatted = formatMessage('INFO', message, context);
      if (data !== undefined) {
        console.info(formatted, data);
      } else {
        console.info(formatted);
      }
    }
  },

  /**
   * Warning log
   */
  warn: (message: string, data?: unknown, context?: string): void => {
    if (shouldLog(LogLevel.WARN)) {
      const formatted = formatMessage('WARN', message, context);
      if (data !== undefined) {
        console.warn(formatted, data);
      } else {
        console.warn(formatted);
      }
    }
  },

  /**
   * Error log (always logged)
   * Automatically masks sensitive information
   */
  error: (message: string, error?: unknown, context?: string): void => {
    // Errors are always logged regardless of environment
    const formatted = formatMessage('ERROR', message, context);
    if (error !== undefined) {
      const maskedError = maskSensitiveData(error);
      console.error(formatted, maskedError);
    } else {
      console.error(formatted);
    }
  },
};
