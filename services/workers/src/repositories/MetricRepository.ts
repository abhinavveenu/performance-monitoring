import type { PoolClient } from 'pg';
import type { MetricRecord } from '../types/database';

export class MetricRepository {
  /**
   * Insert metric record
   */
  static async insert(
    client: PoolClient,
    metric: MetricRecord
  ): Promise<void> {
    try {
      await client.query(
        `INSERT INTO metrics (
          website_id, page_id, timestamp,
          cls, fid, lcp, inp, ttfb,
          device_type, browser, country,
          session_id, user_id
        ) VALUES ($1, $2, to_timestamp($3/1000.0), $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [
          metric.website_id,
          metric.page_id,
          metric.timestamp,
          metric.cls,
          metric.fid,
          metric.lcp,
          metric.inp,
          metric.ttfb,
          metric.device_type,
          metric.browser,
          metric.country,
          metric.session_id,
          metric.user_id,
        ]
      );
    } catch (error) {
      console.error(`Error inserting metric for page ${metric.page_id}:`, error);
      throw new Error(`Failed to insert metric: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

