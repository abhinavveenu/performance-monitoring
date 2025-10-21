/**
 * Performance event types
 */
export interface PerformanceEvent {
  type: string;
  name: string;
  value?: number;
  data?: EventData;
  ts: number;
  page: string;
  sessionId: string;
}

/**
 * Event contextual data
 */
export interface EventData {
  deviceType?: string;
  device?: string;
  browser?: string;
  userAgent?: string;
  country?: string;
  geo?: {
    country?: string;
  };
  userId?: string;
  [key: string]: any;
}

/**
 * Metrics job data
 */
export interface MetricsJobData {
  projectKey: string;
  events: PerformanceEvent[];
}

/**
 * Error job data
 */
export interface ErrorJobData {
  projectKey: string;
  error: ErrorInfo;
  page: string;
  sessionId?: string;
  timestamp?: number;
  userAgent?: string;
  deviceType?: string;
  browser?: string;
  country?: string;
}

/**
 * Error information
 */
export interface ErrorInfo {
  message: string;
  stack?: string;
}

/**
 * Page metrics aggregation
 */
export interface PageMetrics {
  pageUrl: string;
  sessionId: string;
  metrics: MetricValues;
  timestamp: number;
  data: EventData;
}

/**
 * Metric values for core web vitals
 */
export interface MetricValues {
  cls?: number;
  fid?: number;
  lcp?: number;
  inp?: number;
  ttfb?: number;
}

