/**
 * Available time ranges for data queries
 */
export enum TimeRange {
  ONE_HOUR = '1h',
  SIX_HOURS = '6h',
  TWENTY_FOUR_HOURS = '24h',
  SEVEN_DAYS = '7d',
  THIRTY_DAYS = '30d',
}

/**
 * Percentile options for metrics
 */
export enum Percentile {
  P50 = 'p50',
  P75 = 'p75',
  P95 = 'p95',
  P99 = 'p99',
}

/**
 * Dimensions for breakdown analysis
 */
export enum BreakdownDimension {
  DEVICE_TYPE = 'device_type',
  BROWSER = 'browser',
  COUNTRY = 'country',
}

/**
 * Core Web Vitals metric names
 */
export enum MetricName {
  LCP = 'LCP',
  FID = 'FID',
  CLS = 'CLS',
  INP = 'INP',
  TTFB = 'TTFB',
}

