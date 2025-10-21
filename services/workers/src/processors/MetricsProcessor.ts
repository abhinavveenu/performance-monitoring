import type { Pool, PoolClient } from 'pg';
import type { Job } from 'bull';
import type { MetricsJobData, MetricRecord } from '../types';
import { WebsiteRepository, PageRepository, MetricRepository } from '../repositories';
import { extractDomain, extractPath, aggregateEventsByPage, extractDeviceType, extractBrowser, extractCountry, extractUserId } from '../utils';

export class MetricsProcessor {
  constructor(private pool: Pool) {}

  /**
   * Process metrics job
   */
  async process(job: Job<MetricsJobData>): Promise<void> {
    const { projectKey, events } = job.data;

    // Validate input
    if (!projectKey) {
      throw new Error('Missing projectKey in job data');
    }

    if (!events || !Array.isArray(events) || events.length === 0) {
      console.warn(`No events to process for project ${projectKey}`);
      return;
    }

    let client;
    try {
      client = await this.pool.connect();
    } catch (error) {
      console.error('Failed to acquire database connection:', error);
      throw new Error(`Database connection error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    try {
      await client.query('BEGIN');

      // Get or create website
      const websiteId = await this.getOrCreateWebsite(client, projectKey, events);

      // Aggregate events by page
      const pageMetrics = aggregateEventsByPage(events);

      // Process each page's metrics
      for (const [pageUrl, data] of pageMetrics) {
        try {
          await this.processPageMetrics(client, websiteId, pageUrl, data);
        } catch (error) {
          console.error(`Error processing metrics for page ${pageUrl}:`, error);
          // Continue processing other pages
        }
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK').catch(rollbackErr => {
        console.error('Error during rollback:', rollbackErr);
      });
      console.error('Error processing metrics:', error);
      throw error;
    } finally {
      if (client) {
        client.release();
      }
    }
  }

  /**
   * Get or create website
   */
  private async getOrCreateWebsite(
    client: PoolClient,
    projectKey: string,
    events: MetricsJobData['events']
  ): Promise<number> {
    // Try to get existing website
    let websiteId = await WebsiteRepository.getIdByProjectKey(client, projectKey);

    if (!websiteId) {
      // Extract domain from first event's page URL or use projectKey
      const samplePage = events[0]?.page || '';
      const domain = extractDomain(samplePage, projectKey);

      const website = await WebsiteRepository.upsert(client, projectKey, projectKey, domain);
      websiteId = website.id;
    }

    return websiteId;
  }

  /**
   * Process metrics for a single page
   */
  private async processPageMetrics(
    client: PoolClient,
    websiteId: number,
    pageUrl: string,
    data: ReturnType<typeof aggregateEventsByPage> extends Map<string, infer T> ? T : never
  ): Promise<void> {
    // Extract path from page URL
    const path = extractPath(pageUrl);

    // Get or create page
    const page = await PageRepository.upsert(client, websiteId, path, path);

    // Extract context from data
    const deviceType = extractDeviceType(data.data);
    const browser = extractBrowser(data.data);
    const country = extractCountry(data.data);
    const userId = extractUserId(data.data);

    // Create metric record
    const metric: MetricRecord = {
      website_id: websiteId,
      page_id: page.id,
      timestamp: data.timestamp,
      cls: data.metrics.cls ?? null,
      fid: data.metrics.fid ?? null,
      lcp: data.metrics.lcp ?? null,
      inp: data.metrics.inp ?? null,
      ttfb: data.metrics.ttfb ?? null,
      device_type: deviceType,
      browser,
      country,
      session_id: data.sessionId,
      user_id: userId,
    };

    // Insert metric
    await MetricRepository.insert(client, metric);
  }
}

