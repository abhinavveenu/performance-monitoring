/**
 * Worker configuration constants
 */

export const CONFIG = {
  REDIS_URL: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  DATABASE_URL: process.env.DATABASE_URL || 'postgres://perf:perf@localhost:5432/perfdb',
} as const;

export const QUEUE_NAMES = {
  METRICS: 'metrics',
  ERRORS: 'errors',
} as const;

export const METRIC_NAMES = {
  CLS: 'cls',
  FID: 'fid',
  LCP: 'lcp',
  INP: 'inp',
  TTFB: 'ttfb',
} as const;

export const EVENT_TYPES = {
  WEB_VITAL: 'web_vital',
  ERROR: 'error',
} as const;

export const VALID_METRICS = ['cls', 'fid', 'lcp', 'inp', 'ttfb'] as const;
export type MetricName = typeof VALID_METRICS[number];

