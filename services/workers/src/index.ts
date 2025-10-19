import 'dotenv/config';
import Bull from 'bull';
import { Pool } from 'pg';

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const DATABASE_URL = process.env.DATABASE_URL || 'postgres://localhost:5432/perfdb';

const metricsQueue = new Bull('metrics', REDIS_URL);
const errorsQueue = new Bull('errors', REDIS_URL);

const pool = new Pool({ connectionString: DATABASE_URL });

async function bootstrap() {
  await pool.query(`CREATE TABLE IF NOT EXISTS metric_events (
    id BIGSERIAL PRIMARY KEY,
    project_key TEXT NOT NULL,
    type TEXT NOT NULL,
    name TEXT NOT NULL,
    value DOUBLE PRECISION,
    data JSONB,
    ts TIMESTAMPTZ NOT NULL,
    page TEXT,
    session_id TEXT
  );`);

  metricsQueue.process(async (job) => {
    const { projectKey, events } = job.data as { projectKey: string; events: any[] };
    const client = await pool.connect();
    try {
      const insertText = `INSERT INTO metric_events (project_key, type, name, value, data, ts, page, session_id) VALUES ($1,$2,$3,$4,$5, to_timestamp($6/1000.0), $7, $8)`;
      for (const e of events) {
        await client.query(insertText, [projectKey, e.type, e.name, e.value ?? null, e.data ?? null, e.ts, e.page, e.sessionId]);
      }
    } finally {
      client.release();
    }
  });

  errorsQueue.process(async (job) => {
    // TODO: store error events
    return;
  });
}

bootstrap().then(() => {
  console.log('Workers started');
});


