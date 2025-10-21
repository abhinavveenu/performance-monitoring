import { Pool } from 'pg';
import { CacheService } from './cache.js';

export interface TimeRange {
  from: Date;
  to: Date;
}

export interface MetricsSummary {
  lcp: { p50: number; p75: number; p95: number; p99: number };
  fid: { p50: number; p75: number; p95: number; p99: number };
  cls: { p50: number; p75: number; p95: number; p99: number };
  inp: { p50: number; p75: number; p95: number; p99: number };
  ttfb: { p50: number; p75: number; p95: number; p99: number };
  totalSamples: number;
}

export interface TimeSeriesPoint {
  timestamp: string;
  lcp_p95: number;
  fid_p95: number;
  cls_p95: number;
  inp_p95: number;
  ttfb_p95: number;
}

export class MetricsService {
  constructor(
    private pool: Pool,
    private cache: CacheService
  ) {}

  /**
   * Get project metrics summary with caching
   */
  async getProjectSummary(projectKey: string, range: TimeRange): Promise<MetricsSummary> {
    const cacheKey = this.cache.generateKey([
      'project',
      projectKey,
      'summary',
      range.from.toISOString(),
      range.to.toISOString()
    ]);

    return this.cache.cached(cacheKey, 60, async () => {
      const result = await this.pool.query(
        `
        SELECT
          PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY lcp) FILTER (WHERE lcp IS NOT NULL) as lcp_p50,
          PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY lcp) FILTER (WHERE lcp IS NOT NULL) as lcp_p75,
          PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY lcp) FILTER (WHERE lcp IS NOT NULL) as lcp_p95,
          PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY lcp) FILTER (WHERE lcp IS NOT NULL) as lcp_p99,
          
          PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY fid) FILTER (WHERE fid IS NOT NULL) as fid_p50,
          PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY fid) FILTER (WHERE fid IS NOT NULL) as fid_p75,
          PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY fid) FILTER (WHERE fid IS NOT NULL) as fid_p95,
          PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY fid) FILTER (WHERE fid IS NOT NULL) as fid_p99,
          
          PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY cls) FILTER (WHERE cls IS NOT NULL) as cls_p50,
          PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY cls) FILTER (WHERE cls IS NOT NULL) as cls_p75,
          PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY cls) FILTER (WHERE cls IS NOT NULL) as cls_p95,
          PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY cls) FILTER (WHERE cls IS NOT NULL) as cls_p99,
          
          PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY inp) FILTER (WHERE inp IS NOT NULL) as inp_p50,
          PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY inp) FILTER (WHERE inp IS NOT NULL) as inp_p75,
          PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY inp) FILTER (WHERE inp IS NOT NULL) as inp_p95,
          PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY inp) FILTER (WHERE inp IS NOT NULL) as inp_p99,
          
          PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY ttfb) FILTER (WHERE ttfb IS NOT NULL) as ttfb_p50,
          PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY ttfb) FILTER (WHERE ttfb IS NOT NULL) as ttfb_p75,
          PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY ttfb) FILTER (WHERE ttfb IS NOT NULL) as ttfb_p95,
          PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY ttfb) FILTER (WHERE ttfb IS NOT NULL) as ttfb_p99,
          
          COUNT(*) as total_samples
        FROM metrics m
        JOIN websites w ON m.website_id = w.id
        WHERE w.project_key = $1
          AND m.timestamp >= $2
          AND m.timestamp <= $3
        `,
        [projectKey, range.from, range.to]
      );

      const row = result.rows[0];
      return {
        lcp: {
          p50: Math.round(row.lcp_p50 || 0),
          p75: Math.round(row.lcp_p75 || 0),
          p95: Math.round(row.lcp_p95 || 0),
          p99: Math.round(row.lcp_p99 || 0),
        },
        fid: {
          p50: Math.round(row.fid_p50 || 0),
          p75: Math.round(row.fid_p75 || 0),
          p95: Math.round(row.fid_p95 || 0),
          p99: Math.round(row.fid_p99 || 0),
        },
        cls: {
          p50: parseFloat((row.cls_p50 || 0).toFixed(3)),
          p75: parseFloat((row.cls_p75 || 0).toFixed(3)),
          p95: parseFloat((row.cls_p95 || 0).toFixed(3)),
          p99: parseFloat((row.cls_p99 || 0).toFixed(3)),
        },
        inp: {
          p50: Math.round(row.inp_p50 || 0),
          p75: Math.round(row.inp_p75 || 0),
          p95: Math.round(row.inp_p95 || 0),
          p99: Math.round(row.inp_p99 || 0),
        },
        ttfb: {
          p50: Math.round(row.ttfb_p50 || 0),
          p75: Math.round(row.ttfb_p75 || 0),
          p95: Math.round(row.ttfb_p95 || 0),
          p99: Math.round(row.ttfb_p99 || 0),
        },
        totalSamples: parseInt(row.total_samples || 0),
      };
    });
  }

  /**
   * Get time series data for charting
   */
  async getTimeSeries(
    projectKey: string,
    range: TimeRange,
    interval: string = '1 hour'
  ): Promise<TimeSeriesPoint[]> {
    const cacheKey = this.cache.generateKey([
      'project',
      projectKey,
      'timeseries',
      interval,
      range.from.toISOString(),
      range.to.toISOString()
    ]);

    return this.cache.cached(cacheKey, 60, async () => {
      const result = await this.pool.query(
        `
        SELECT
          time_bucket($1::interval, m.timestamp) as bucket,
          PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY lcp) FILTER (WHERE lcp IS NOT NULL) as lcp_p50,
          PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY lcp) FILTER (WHERE lcp IS NOT NULL) as lcp_p75,
          PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY lcp) FILTER (WHERE lcp IS NOT NULL) as lcp_p95,
          PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY lcp) FILTER (WHERE lcp IS NOT NULL) as lcp_p99,
          PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY fid) FILTER (WHERE fid IS NOT NULL) as fid_p50,
          PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY fid) FILTER (WHERE fid IS NOT NULL) as fid_p75,
          PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY fid) FILTER (WHERE fid IS NOT NULL) as fid_p95,
          PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY fid) FILTER (WHERE fid IS NOT NULL) as fid_p99,
          PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY cls) FILTER (WHERE cls IS NOT NULL) as cls_p50,
          PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY cls) FILTER (WHERE cls IS NOT NULL) as cls_p75,
          PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY cls) FILTER (WHERE cls IS NOT NULL) as cls_p95,
          PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY cls) FILTER (WHERE cls IS NOT NULL) as cls_p99,
          PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY inp) FILTER (WHERE inp IS NOT NULL) as inp_p50,
          PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY inp) FILTER (WHERE inp IS NOT NULL) as inp_p75,
          PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY inp) FILTER (WHERE inp IS NOT NULL) as inp_p95,
          PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY inp) FILTER (WHERE inp IS NOT NULL) as inp_p99,
          PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY ttfb) FILTER (WHERE ttfb IS NOT NULL) as ttfb_p50,
          PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY ttfb) FILTER (WHERE ttfb IS NOT NULL) as ttfb_p75,
          PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY ttfb) FILTER (WHERE ttfb IS NOT NULL) as ttfb_p95,
          PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY ttfb) FILTER (WHERE ttfb IS NOT NULL) as ttfb_p99
        FROM metrics m
        JOIN websites w ON m.website_id = w.id
        WHERE w.project_key = $2
          AND m.timestamp >= $3
          AND m.timestamp <= $4
        GROUP BY bucket
        ORDER BY bucket ASC
        `,
        [interval, projectKey, range.from, range.to]
      );

      return result.rows.map(row => ({
        timestamp: row.bucket,
        lcp_p50: Math.round(row.lcp_p50 || 0),
        lcp_p75: Math.round(row.lcp_p75 || 0),
        lcp_p95: Math.round(row.lcp_p95 || 0),
        lcp_p99: Math.round(row.lcp_p99 || 0),
        fid_p50: Math.round(row.fid_p50 || 0),
        fid_p75: Math.round(row.fid_p75 || 0),
        fid_p95: Math.round(row.fid_p95 || 0),
        fid_p99: Math.round(row.fid_p99 || 0),
        cls_p50: parseFloat((row.cls_p50 || 0).toFixed(3)),
        cls_p75: parseFloat((row.cls_p75 || 0).toFixed(3)),
        cls_p95: parseFloat((row.cls_p95 || 0).toFixed(3)),
        cls_p99: parseFloat((row.cls_p99 || 0).toFixed(3)),
        inp_p50: Math.round(row.inp_p50 || 0),
        inp_p75: Math.round(row.inp_p75 || 0),
        inp_p95: Math.round(row.inp_p95 || 0),
        inp_p99: Math.round(row.inp_p99 || 0),
        ttfb_p50: Math.round(row.ttfb_p50 || 0),
        ttfb_p75: Math.round(row.ttfb_p75 || 0),
        ttfb_p95: Math.round(row.ttfb_p95 || 0),
        ttfb_p99: Math.round(row.ttfb_p99 || 0),
      }));
    });
  }

  /**
   * Get pages list for a project
   */
  async getProjectPages(projectKey: string, limit: number = 50) {
    const cacheKey = this.cache.generateKey(['project', projectKey, 'pages', String(limit)]);

    return this.cache.cached(cacheKey, 120, async () => {
      const result = await this.pool.query(
        `
        SELECT
          p.id,
          p.path,
          p.page_name,
          COUNT(m.id) as sample_count,
          PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY m.lcp) FILTER (WHERE m.lcp IS NOT NULL) as lcp_p95,
          MAX(m.timestamp) as last_seen
        FROM pages p
        JOIN websites w ON p.website_id = w.id
        LEFT JOIN metrics m ON p.id = m.page_id
          AND m.timestamp > NOW() - INTERVAL '24 hours'
        WHERE w.project_key = $1
        GROUP BY p.id, p.path, p.page_name
        ORDER BY sample_count DESC
        LIMIT $2
        `,
        [projectKey, limit]
      );

      return result.rows;
    });
  }

  /**
   * Get page metrics details
   */
  async getPageMetrics(pageId: number, range: TimeRange) {
    const result = await this.pool.query(
      `
      SELECT
        m.timestamp,
        m.lcp,
        m.fid,
        m.cls,
        m.inp,
        m.ttfb,
        m.device_type,
        m.browser,
        m.country,
        m.session_id
      FROM metrics m
      WHERE m.page_id = $1
        AND m.timestamp >= $2
        AND m.timestamp <= $3
      ORDER BY m.timestamp DESC
      LIMIT 1000
      `,
      [pageId, range.from, range.to]
    );

    return result.rows;
  }

  /**
   * Get slow pages for a project
   */
  async getSlowPages(projectKey: string, metric: string = 'lcp', limit: number = 10) {
    const cacheKey = this.cache.generateKey(['project', projectKey, 'slow_pages', metric, String(limit)]);

    return this.cache.cached(cacheKey, 120, async () => {
      const metricColumn = ['lcp', 'fid', 'cls', 'inp', 'ttfb'].includes(metric) ? metric : 'lcp';
      
      const result = await this.pool.query(
        `
        SELECT
          p.id,
          p.path,
          p.page_name,
          PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY m.${metricColumn}) as metric_p95,
          COUNT(*) as sample_count
        FROM pages p
        JOIN websites w ON p.website_id = w.id
        JOIN metrics m ON p.id = m.page_id
        WHERE w.project_key = $1
          AND m.timestamp > NOW() - INTERVAL '24 hours'
          AND m.${metricColumn} IS NOT NULL
        GROUP BY p.id, p.path, p.page_name
        HAVING COUNT(*) >= 10
        ORDER BY metric_p95 DESC
        LIMIT $2
        `,
        [projectKey, limit]
      );

      return result.rows;
    });
  }

  /**
   * Get session journey
   */
  async getSessionJourney(sessionId: string) {
    const result = await this.pool.query(
      `
      SELECT
        m.timestamp,
        p.path,
        m.lcp,
        m.fid,
        m.cls,
        m.inp,
        m.ttfb,
        m.device_type,
        m.browser
      FROM metrics m
      JOIN pages p ON m.page_id = p.id
      WHERE m.session_id = $1
      ORDER BY m.timestamp ASC
      `,
      [sessionId]
    );

    return result.rows;
  }

  /**
   * Get session errors
   */
  async getSessionErrors(sessionId: string) {
    const result = await this.pool.query(
      `
      SELECT
        e.timestamp,
        p.path,
        e.error_message,
        e.stack_trace
      FROM js_errors e
      JOIN pages p ON e.page_id = p.id
      WHERE e.session_id = $1
      ORDER BY e.timestamp ASC
      `,
      [sessionId]
    );

    return result.rows;
  }

  /**
   * Get metrics breakdown by dimension
   */
  async getBreakdown(
    projectKey: string,
    dimension: 'device_type' | 'browser' | 'country',
    range: TimeRange
  ) {
    const cacheKey = this.cache.generateKey([
      'project',
      projectKey,
      'breakdown',
      dimension,
      range.from.toISOString(),
      range.to.toISOString()
    ]);

    return this.cache.cached(cacheKey, 120, async () => {
      const result = await this.pool.query(
        `
        SELECT
          m.${dimension} as dimension_value,
          COUNT(*) as sample_count,
          PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY lcp) FILTER (WHERE lcp IS NOT NULL) as lcp_p95,
          PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY fid) FILTER (WHERE fid IS NOT NULL) as fid_p95,
          PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY cls) FILTER (WHERE cls IS NOT NULL) as cls_p95
        FROM metrics m
        JOIN websites w ON m.website_id = w.id
        WHERE w.project_key = $1
          AND m.timestamp >= $2
          AND m.timestamp <= $3
          AND m.${dimension} IS NOT NULL
        GROUP BY m.${dimension}
        ORDER BY sample_count DESC
        `,
        [projectKey, range.from, range.to]
      );

      return result.rows;
    });
  }
}

