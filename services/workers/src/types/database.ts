/**
 * Website record from database
 */
export interface Website {
  id: number;
  project_key: string;
  name: string;
  domain: string;
  created_at: Date;
}

/**
 * Page record from database
 */
export interface Page {
  id: number;
  website_id: number;
  path: string;
  page_name: string | null;
  created_at: Date;
}

/**
 * Metric record for insertion
 */
export interface MetricRecord {
  website_id: number;
  page_id: number;
  timestamp: number;
  cls: number | null;
  fid: number | null;
  lcp: number | null;
  inp: number | null;
  ttfb: number | null;
  device_type: string | null;
  browser: string | null;
  country: string | null;
  session_id: string | null;
  user_id: string | null;
}

/**
 * Error record for insertion
 */
export interface ErrorRecord {
  website_id: number;
  page_id: number;
  timestamp: number;
  error_message: string;
  stack_trace: string | null;
  user_agent: string | null;
  device_type: string | null;
  browser: string | null;
  country: string | null;
  session_id: string | null;
}

