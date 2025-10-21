import 'dotenv/config';
import { Pool } from 'pg';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://localhost:5432/perfdb';

async function initializeDatabase() {
  const pool = new Pool({ connectionString: DATABASE_URL });
  const client = await pool.connect();

  try {
    console.log('Starting database initialization...');

    // Create TimescaleDB extension if not exists
    await client.query(`CREATE EXTENSION IF NOT EXISTS timescaledb;`);
    console.log('TimescaleDB extension created');

    // Create websites table
    await client.query(`
      CREATE TABLE IF NOT EXISTS websites (
        id SERIAL PRIMARY KEY,
        project_key TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        domain TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('Websites table created');

    // Create pages table
    await client.query(`
      CREATE TABLE IF NOT EXISTS pages (
        id SERIAL PRIMARY KEY,
        website_id INTEGER NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
        path TEXT NOT NULL,
        page_name TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE (website_id, path)
      );
    `);
    console.log('Pages table created');

    // Create metrics table
    await client.query(`
      CREATE TABLE IF NOT EXISTS metrics (
        id BIGSERIAL,
        website_id INTEGER NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
        page_id INTEGER NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
        timestamp TIMESTAMPTZ NOT NULL,
        
        cls REAL,
        fid INTEGER,
        lcp INTEGER,
        inp INTEGER,
        ttfb INTEGER,
        
        device_type TEXT,
        browser TEXT,
        country TEXT,
        
        js_errors_count INTEGER DEFAULT 0,
        
        session_id TEXT,
        user_id TEXT
      );
    `);
    console.log('Metrics table created');

    // Create hypertable for metrics (only if not already a hypertable)
    try {
      await client.query(`
        SELECT create_hypertable('metrics', 'timestamp', 
          chunk_time_interval => INTERVAL '1 day',
          if_not_exists => TRUE
        );
      `);
      console.log('Metrics hypertable created');
    } catch (error: any) {
      if (error.message.includes('already a hypertable')) {
        console.log('Metrics hypertable already exists');
      } else {
        throw error;
      }
    }

    // Create indexes for metrics
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_metrics_website_timestamp 
      ON metrics (website_id, timestamp DESC);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_metrics_page 
      ON metrics (page_id, timestamp DESC);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_metrics_session 
      ON metrics (session_id) WHERE session_id IS NOT NULL;
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_metrics_context 
      ON metrics (device_type, browser, country);
    `);
    console.log('Metrics indexes created');

    // Create js_errors table
    await client.query(`
      CREATE TABLE IF NOT EXISTS js_errors (
        id BIGSERIAL,
        website_id INTEGER NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
        page_id INTEGER NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
        timestamp TIMESTAMPTZ NOT NULL,
        error_message TEXT NOT NULL,
        stack_trace TEXT,
        user_agent TEXT,
        device_type TEXT,
        browser TEXT,
        country TEXT,
        session_id TEXT
      );
    `);
    console.log('JS Errors table created');

    // Create hypertable for js_errors
    try {
      await client.query(`
        SELECT create_hypertable('js_errors', 'timestamp',
          chunk_time_interval => INTERVAL '1 day',
          if_not_exists => TRUE
        );
      `);
      console.log('JS Errors hypertable created');
    } catch (error: any) {
      if (error.message.includes('already a hypertable')) {
        console.log('JS Errors hypertable already exists');
      } else {
        throw error;
      }
    }

    // Create indexes for js_errors
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_js_errors_website_timestamp 
      ON js_errors (website_id, timestamp DESC);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_js_errors_page 
      ON js_errors (page_id, timestamp DESC);
    `);
    console.log('JS Errors indexes created');

    console.log('\nDatabase initialization completed successfully!');
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

initializeDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

