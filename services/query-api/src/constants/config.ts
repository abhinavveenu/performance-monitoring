/**
 * Query API configuration
 */
export const CONFIG = {
  PORT: parseInt(process.env.QUERY_PORT || '4001', 10),
  REDIS_URL: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  DATABASE_URL: process.env.DATABASE_URL || 'postgres://perf:perf@localhost:5432/perfdb',
  NODE_ENV: process.env.NODE_ENV || 'development',
} as const;

/**
 * Cache TTL in seconds
 */
export const CACHE_TTL = {
  SUMMARY: 60,           // 1 minute
  TIMESERIES: 60,        // 1 minute
  PAGES: 120,            // 2 minutes
  BREAKDOWN: 60,         // 1 minute
  SESSION: 300,          // 5 minutes
} as const;

/**
 * Rate limiting configuration
 */
export const RATE_LIMIT = {
  WINDOW_MS: 60 * 1000,  // 1 minute
  MAX_REQUESTS: 100,     // per window
} as const;

/**
 * Query defaults
 */
export const DEFAULTS = {
  TIME_RANGE: '24h',
  PAGE_LIMIT: 50,
  INTERVAL: '1 hour',
} as const;

/**
 * Valid dimensions for breakdown
 */
export const VALID_DIMENSIONS = ['device_type', 'browser', 'country'] as const;

/**
 * Valid time ranges
 */
export const VALID_TIME_RANGES = ['1h', '6h', '24h', '7d', '30d'] as const;

