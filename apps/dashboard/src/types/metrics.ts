/**
 * Performance metric with percentile values
 */
export interface PerfMetric {
  p50: number;
  p75: number;
  p95: number;
  p99: number;
}

/**
 * Summary of all Core Web Vitals metrics
 */
export interface MetricsSummary {
  lcp: PerfMetric;
  fid: PerfMetric;
  cls: PerfMetric;
  inp: PerfMetric;
  ttfb: PerfMetric;
  totalSamples: number;
}

/**
 * Time series data point with all percentiles
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
 * Page information with metrics
 */
export interface Page {
  id: number;
  path: string;
  page_name: string;
  sample_count: number;
  lcp_p95: number;
  last_seen: string;
}

/**
 * Breakdown data by dimension
 */
export interface Breakdown {
  dimension_value: string;
  sample_count: number;
  lcp_p95: number;
  fid_p95: number;
  cls_p95: number;
}

/**
 * Metric metadata for rendering
 */
export interface MetricConfig {
  name: string;
  key: keyof MetricsSummary;
  unit: string;
  isCLS: boolean;
  color: string;
}