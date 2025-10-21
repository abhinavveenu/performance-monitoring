import type { Pool, PoolClient } from 'pg';
import type { Job } from 'bull';
import type { ErrorJobData, ErrorRecord } from '../types';
import { WebsiteRepository, PageRepository, ErrorRepository } from '../repositories';
import { extractPath } from '../utils';

export class ErrorsProcessor {
  constructor(private pool: Pool) {}

  /**
   * Process error job
   */
  async process(job: Job<ErrorJobData>): Promise<void> {
    const { projectKey, error, page, sessionId, timestamp, userAgent, deviceType, browser, country } = job.data;

    // Validate input
    if (!projectKey) {
      throw new Error('Missing projectKey in job data');
    }

    if (!page) {
      throw new Error('Missing page URL in job data');
    }

    let client;
    try {
      client = await this.pool.connect();
    } catch (err) {
      console.error('Failed to acquire database connection:', err);
      throw new Error(`Database connection error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
    
    try {
      await client.query('BEGIN');

      // Get website
      const websiteId = await WebsiteRepository.getIdByProjectKey(client, projectKey);

      if (!websiteId) {
        // Skip if website doesn't exist
        console.warn(`Website not found for project ${projectKey}, skipping error`);
        await client.query('ROLLBACK');
        return;
      }

      // Get or create page
      const pageId = await this.getOrCreatePage(client, websiteId, page);

      // Create error record
      const errorRecord: ErrorRecord = {
        website_id: websiteId,
        page_id: pageId,
        timestamp: timestamp || Date.now(),
        error_message: error?.message || (typeof error === 'string' ? error : 'Unknown error'),
        stack_trace: error?.stack || null,
        user_agent: userAgent || null,
        device_type: deviceType || null,
        browser: browser || null,
        country: country || null,
        session_id: sessionId || null,
      };

      // Insert error
      await ErrorRepository.insert(client, errorRecord);

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK').catch(rollbackErr => {
        console.error('Error during rollback:', rollbackErr);
      });
      console.error('Error processing error event:', err);
      throw err;
    } finally {
      if (client) {
        client.release();
      }
    }
  }

  /**
   * Get or create page
   */
  private async getOrCreatePage(
    client: PoolClient,
    websiteId: number,
    pageUrl: string
  ): Promise<number> {
    const path = extractPath(pageUrl);
    const page = await PageRepository.upsert(client, websiteId, path, path);
    return page.id;
  }
}

