import { MetricName } from '../types/enums';
import type { MetricConfig } from '../types/metrics';

/**
 * API configuration
 */
export const API_CONFIG = {
  QUERY_API_URL: import.meta.env.VITE_QUERY_API_URL || 'http://localhost:4001',
  DEFAULT_PROJECT_KEY: import.meta.env.VITE_PROJECT_KEY || 'demo',
  REFRESH_INTERVAL: 10000, // 10 seconds
} as const;

/**
 * Available projects
 * In production, this would come from an API endpoint
 */
export const AVAILABLE_PROJECTS = [
  { key: 'demo', name: 'Demo Project' },
  { key: 'production', name: 'Production' },
  { key: 'staging', name: 'Staging' },
] as const;

/**
 * Time range labels for dropdown
 */
export const TIME_RANGE_LABELS: Record<string, string> = {
  '1h': 'Last Hour',
  '6h': 'Last 6 Hours',
  '24h': 'Last 24 Hours',
  '7d': 'Last 7 Days',
  '30d': 'Last 30 Days',
} as const;

/**
 * Percentile labels for dropdown
 */
export const PERCENTILE_LABELS: Record<string, string> = {
  p50: 'P50 (Median)',
  p75: 'P75',
  p95: 'P95',
  p99: 'P99',
} as const;

/**
 * Dimension labels for breakdown
 */
export const DIMENSION_LABELS: Record<string, string> = {
  device_type: 'Device Type',
  browser: 'Browser',
  country: 'Country',
} as const;

/**
 * Core Web Vitals thresholds (in milliseconds for timing metrics)
 */
export const METRIC_THRESHOLDS = {
  [MetricName.LCP]: { good: 2500, needsImprovement: 4000 },
  [MetricName.FID]: { good: 100, needsImprovement: 300 },
  [MetricName.CLS]: { good: 0.1, needsImprovement: 0.25 },
  [MetricName.INP]: { good: 200, needsImprovement: 500 },
  [MetricName.TTFB]: { good: 800, needsImprovement: 1800 },
} as const;

/**
 * Chart colors for metrics
 */
export const METRIC_COLORS = {
  [MetricName.LCP]: '#8b5cf6',
  [MetricName.FID]: '#10b981',
  [MetricName.CLS]: '#ec4899',
  [MetricName.INP]: '#3b82f6',
  [MetricName.TTFB]: '#f59e0b',
} as const;

/**
 * Status colors
 */
export const STATUS_COLORS = {
  GOOD: '#10b981',
  NEEDS_IMPROVEMENT: '#f59e0b',
  POOR: '#ef4444',
} as const;

/**
 * Metric configurations for rendering
 */
export const METRICS_CONFIG: MetricConfig[] = [
  { name: MetricName.LCP, key: 'lcp', unit: 'ms', isCLS: false, color: METRIC_COLORS.LCP },
  { name: MetricName.FID, key: 'fid', unit: 'ms', isCLS: false, color: METRIC_COLORS.FID },
  { name: MetricName.CLS, key: 'cls', unit: '', isCLS: true, color: METRIC_COLORS.CLS },
  { name: MetricName.INP, key: 'inp', unit: 'ms', isCLS: false, color: METRIC_COLORS.INP },
  { name: MetricName.TTFB, key: 'ttfb', unit: 'ms', isCLS: false, color: METRIC_COLORS.TTFB },
] as const;

