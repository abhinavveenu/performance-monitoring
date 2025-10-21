import type { Pool } from 'pg';

/**
 * Validate that required database tables exist
 * This is a ONE-TIME check at startup to fail fast if schema is not initialized
 * 
 * NOTE: This does NOT create tables - it only validates they exist
 * Tables must be created using: npm run init-db
 */
export async function validateDatabaseSchema(pool: Pool): Promise<void> {
  const requiredTables = ['websites', 'pages', 'metrics', 'js_errors'];
  
  const client = await pool.connect();
  
  try {
    for (const tableName of requiredTables) {
      const result = await client.query(
        `SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        )`,
        [tableName]
      );
      
      if (!result.rows[0].exists) {
        throw new Error(
          `Table '${tableName}' does not exist. Please run 'npm run init-db' first.`
        );
      }
    }
    
    console.log('Database schema validation passed');
  } finally {
    client.release();
  }
}

