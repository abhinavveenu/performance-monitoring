import type { PoolClient } from 'pg';
import type { Website } from '../types/database';

export class WebsiteRepository {
  /**
   * Get website by project key
   */
  static async getByProjectKey(
    client: PoolClient,
    projectKey: string
  ): Promise<Website | null> {
    try {
      const result = await client.query<Website>(
        'SELECT id, project_key, name, domain, created_at FROM websites WHERE project_key = $1',
        [projectKey]
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error(`Error fetching website by project key ${projectKey}:`, error);
      throw new Error(`Failed to fetch website: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create or update website
   */
  static async upsert(
    client: PoolClient,
    projectKey: string,
    name: string,
    domain: string
  ): Promise<Website> {
    try {
      const result = await client.query<Website>(
        `INSERT INTO websites (project_key, name, domain) 
         VALUES ($1, $2, $3) 
         ON CONFLICT (project_key) DO UPDATE SET domain = EXCLUDED.domain
         RETURNING id, project_key, name, domain, created_at`,
        [projectKey, name, domain]
      );

      if (!result.rows[0]) {
        throw new Error('No website returned from upsert');
      }

      return result.rows[0];
    } catch (error) {
      console.error(`Error upserting website ${projectKey}:`, error);
      throw new Error(`Failed to upsert website: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get website ID by project key
   */
  static async getIdByProjectKey(
    client: PoolClient,
    projectKey: string
  ): Promise<number | null> {
    try {
      const result = await client.query<{ id: number }>(
        'SELECT id FROM websites WHERE project_key = $1',
        [projectKey]
      );

      return result.rows[0]?.id || null;
    } catch (error) {
      console.error(`Error fetching website ID for project ${projectKey}:`, error);
      throw new Error(`Failed to fetch website ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

