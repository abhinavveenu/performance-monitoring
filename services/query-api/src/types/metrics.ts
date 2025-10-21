/**
 * Percentile metric data
 */
export interface PercentileMetric {
  p50: number;
  p75: number;
  p95: number;
  p99: number;
}

/**
 * Metrics summary response
 */
export interface MetricsSummary {
  lcp: PercentileMetric;
  fid: PercentileMetric;
  cls: PercentileMetric;
  inp: PercentileMetric;
  ttfb: PercentileMetric;
  totalSamples: number;
}

/**
 * Time series data point
 */
export interface TimeSeriesPoint {
  timestamp: string;
  lcp_p50: number;
  lcp_p75: number;
  lcp_p95: number;
  lcp_p99: number;
  fid_p50: number;
  fid_p75: number;
  fid_p95: number;
  fid_p99: number;
  cls_p50: number;
  cls_p75: number;
  cls_p95: number;
  cls_p99: number;
  inp_p50: number;
  inp_p75: number;
  inp_p95: number;
  inp_p99: number;
  ttfb_p50: number;
  ttfb_p75: number;
  ttfb_p95: number;
  ttfb_p99: number;
}

/**
 * Page metrics
 */
export interface PageMetrics {
  id: number;
  path: string;
  page_name: string;
  sample_count: number;
  lcp_p95: number;
  last_seen: string;
}

/**
 * Breakdown metrics by dimension
 */
export interface BreakdownMetrics {
  dimension_value: string;
  sample_count: number;
  lcp_p95: number;
  fid_p95: number;
  cls_p95: number;
}

/**
 * Session journey
 */
export interface SessionJourney {
  timestamp: string;
  page: string;
  lcp: number | null;
  fid: number | null;
  cls: number | null;
  inp: number | null;
  ttfb: number | null;
}

/**
 * Session errors
 */
export interface SessionError {
  timestamp: string;
  page: string;
  error_message: string;
  stack_trace: string | null;
}

/**
 * Time range for queries
 */
export interface TimeRange {
  from: Date;
  to: Date;
}

