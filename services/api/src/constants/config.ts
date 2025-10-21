/**
 * API server configuration
 */
export const CONFIG = {
  PORT: parseInt(process.env.PORT || '4000', 10),
  REDIS_URL: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  NODE_ENV: process.env.NODE_ENV || 'development',
} as const;

/**
 * Queue names
 */
export const QUEUE_NAMES = {
  METRICS: 'metrics',
  ERRORS: 'errors',
} as const;

/**
 * Rate limiting configuration
 */
export const RATE_LIMIT = {
  WINDOW_MS: 60 * 1000, // 1 minute
  MAX_REQUESTS: 10000, // per window
} as const;

/**
 * Request limits
 */
export const LIMITS = {
  JSON_BODY_SIZE: '2mb',
  MAX_EVENTS_PER_REQUEST: 1000,
} as const;

/**
 * Valid event types
 */
export const EVENT_TYPES = {
  WEB_VITAL: 'web_vital',
  RESOURCE: 'resource',
  ERROR: 'error',
} as const;

