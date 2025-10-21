import type { PoolClient } from 'pg';
import type { Page } from '../types/database';

export class PageRepository {
  /**
   * Get or create page
   */
  static async upsert(
    client: PoolClient,
    websiteId: number,
    path: string,
    pageName: string
  ): Promise<Page> {
    const result = await client.query<Page>(
      `INSERT INTO pages (website_id, path, page_name)
       VALUES ($1, $2, $3)
       ON CONFLICT (website_id, path) DO UPDATE SET page_name = EXCLUDED.page_name
       RETURNING id, website_id, path, page_name, created_at`,
      [websiteId, path, pageName]
    );

    return result.rows[0];
  }

  /**
   * Get page ID
   */
  static async getId(
    client: PoolClient,
    websiteId: number,
    path: string
  ): Promise<number | null> {
    const result = await client.query<{ id: number }>(
      'SELECT id FROM pages WHERE website_id = $1 AND path = $2',
      [websiteId, path]
    );

    return result.rows[0]?.id || null;
  }
}

