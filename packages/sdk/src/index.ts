export type PerfMonitorConfig = {
  projectKey: string;
  apiKey: string;
  endpoint: string;
  sampleRate?: number;
  enableErrorTracking?: boolean;
  enableResourceTiming?: boolean;
  flushIntervalMs?: number; // default 5000
  maxBatchSize?: number; // default 10
};

type MetricEvent = {
  type: 'web_vital' | 'resource' | 'error';
  name: string;
  value?: number;
  data?: any;
  ts: number;
  page: string;
  sessionId: string;
};

class SessionManager {
  private sessionId: string;
  constructor() {
    const existing = window.sessionStorage.getItem('pm_session_id');
    this.sessionId = existing || self.crypto.randomUUID();
    if (!existing) {
      window.sessionStorage.setItem('pm_session_id', this.sessionId);
    }
  }
  getId() {
    return this.sessionId;
  }
}

class BeaconSender {
  private queue: MetricEvent[] = [];
  private timer: number | null = null;
  constructor(private config: Required<Pick<PerfMonitorConfig, 'endpoint'>> & { apiKey: string; projectKey: string; flushIntervalMs: number; maxBatchSize: number }) {}

  enqueue(ev: MetricEvent) {
    this.queue.push(ev);
    if (this.queue.length >= this.config.maxBatchSize) {
      this.flush();
    } else if (this.timer === null) {
      this.timer = self.setTimeout(() => this.flush(), this.config.flushIntervalMs) as unknown as number;
    }
  }

  flush() {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.queue.length === 0) return;
    const batch = this.queue.splice(0, this.config.maxBatchSize);
    const payload = JSON.stringify({ projectKey: this.config.projectKey, events: batch });
    
    // Use fetch with keepalive to support custom headers (x-api-key)
    // sendBeacon doesn't support custom headers
    fetch(this.config.endpoint + '/v1/ingest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey
      },
      body: payload,
      keepalive: true
    }).catch((err) => {
      if (typeof console !== 'undefined') {
        console.error('Failed to send metrics:', err);
      }
    });
  }
}

export class PerfMonitor {
  private static _instance: PerfMonitor | null = null;
  private config!: Required<PerfMonitorConfig>;
  private session!: SessionManager;
  private sender!: BeaconSender;

  static init(config: PerfMonitorConfig) {
    if (!this._instance) this._instance = new PerfMonitor();
    this._instance.configure(config);
    return this._instance;
  }

  static get instance() {
    if (!this._instance) throw new Error('PerfMonitor not initialized');
    return this._instance;
  }

  private configure(config: PerfMonitorConfig) {
    const resolved: Required<PerfMonitorConfig> = {
      sampleRate: 1.0,
      enableErrorTracking: true,
      enableResourceTiming: true,
      flushIntervalMs: 5000,
      maxBatchSize: 10,
      ...config,
    } as Required<PerfMonitorConfig>;
    this.config = resolved;
    this.session = new SessionManager();
    this.sender = new BeaconSender({ endpoint: resolved.endpoint, apiKey: resolved.apiKey, projectKey: resolved.projectKey, flushIntervalMs: resolved.flushIntervalMs, maxBatchSize: resolved.maxBatchSize });
    this.startCollectors();
  }

  private startCollectors() {
    import('web-vitals').then(({ onCLS, onFID, onLCP, onINP, onTTFB }) => {
      const sendMetric = (metric: any) => {
        if (Math.random() > this.config.sampleRate) return;
        const ev: MetricEvent = {
          type: 'web_vital',
          name: metric.name,
          value: metric.value,
          ts: Date.now(),
          page: location.pathname + location.search,
          sessionId: this.session.getId(),
        };
        this.sender.enqueue(ev);
      };
      onCLS(sendMetric);
      onFID(sendMetric);
      onLCP(sendMetric);
      onINP(sendMetric);
      onTTFB(sendMetric);
    });

    if (this.config.enableResourceTiming && 'performance' in window) {
      try {
        const entries = performance.getEntriesByType('resource');
        for (const e of entries) {
          const ev: MetricEvent = {
            type: 'resource',
            name: 'resource_timing',
            data: {
              name: (e as PerformanceResourceTiming).name,
              startTime: e.startTime,
              duration: e.duration,
              initiatorType: (e as any).initiatorType,
              transferSize: (e as any).transferSize,
            },
            ts: Date.now(),
            page: location.pathname + location.search,
            sessionId: this.session.getId(),
          };
          this.sender.enqueue(ev);
        }
      } catch {}
    }

    if (this.config.enableErrorTracking) {
      self.addEventListener('error', (e) => {
        const ev: MetricEvent = {
          type: 'error',
          name: 'error',
          data: { message: e.message, filename: (e as ErrorEvent).filename, lineno: (e as ErrorEvent).lineno, colno: (e as ErrorEvent).colno },
          ts: Date.now(),
          page: location.pathname + location.search,
          sessionId: this.session.getId(),
        };
        this.sender.enqueue(ev);
      });
      self.addEventListener('unhandledrejection', (e) => {
        const ev: MetricEvent = {
          type: 'error',
          name: 'unhandledrejection',
          data: { reason: (e as PromiseRejectionEvent).reason?.toString?.() || 'unknown' },
          ts: Date.now(),
          page: location.pathname + location.search,
          sessionId: this.session.getId(),
        };
        this.sender.enqueue(ev);
      });
    }
  }
}

export default PerfMonitor;

