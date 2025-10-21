/**
 * Ingest event type
 */
export interface IngestEvent {
  type: 'web_vital' | 'resource' | 'error';
  name: string;
  value?: number;
  data?: any;
  ts: number;
  page: string;
  sessionId: string;
}

/**
 * Ingest request body
 */
export interface IngestRequest {
  projectKey: string;
  events: IngestEvent[];
}

/**
 * Error report request
 */
export interface ErrorRequest {
  projectKey: string;
  error: {
    message: string;
    stack?: string;
  };
  page: string;
  sessionId?: string;
  timestamp?: number;
  userAgent?: string;
  deviceType?: string;
  browser?: string;
  country?: string;
}

