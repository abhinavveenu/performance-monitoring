import type { PoolClient } from 'pg';
import type { ErrorRecord } from '../types/database';

export class ErrorRepository {
  /**
   * Insert error record
   */
  static async insert(
    client: PoolClient,
    error: ErrorRecord
  ): Promise<void> {
    await client.query(
      `INSERT INTO js_errors (
        website_id, page_id, timestamp,
        error_message, stack_trace, user_agent,
        device_type, browser, country, session_id
      ) VALUES ($1, $2, to_timestamp($3/1000.0), $4, $5, $6, $7, $8, $9, $10)`,
      [
        error.website_id,
        error.page_id,
        error.timestamp,
        error.error_message,
        error.stack_trace,
        error.user_agent,
        error.device_type,
        error.browser,
        error.country,
        error.session_id,
      ]
    );
  }
}

