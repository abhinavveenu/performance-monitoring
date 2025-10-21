import 'dotenv/config';
import Bull from 'bull';
import { Pool } from 'pg';
import { CONFIG, QUEUE_NAMES } from './constants/config';
import { MetricsProcessor, ErrorsProcessor } from './processors';
import { validateDatabaseSchema } from './utils/dbValidator';

/**
 * Initialize Bull queues
 */
const metricsQueue = new Bull(QUEUE_NAMES.METRICS, CONFIG.REDIS_URL);
const errorsQueue = new Bull(QUEUE_NAMES.ERRORS, CONFIG.REDIS_URL);

/**
 * Initialize database connection pool
 * 
 * IMPORTANT: Database tables must be created BEFORE starting workers
 * Run: npm run init-db
 */
const pool = new Pool({ connectionString: CONFIG.DATABASE_URL });

/**
 * Initialize processors
 * These processors ONLY insert/update data - they do NOT create tables
 */
const metricsProcessor = new MetricsProcessor(pool);
const errorsProcessor = new ErrorsProcessor(pool);

/**
 * Bootstrap workers
 */
async function bootstrap(): Promise<void> {
  console.log('Starting workers...');
  console.log(`Metrics queue: ${QUEUE_NAMES.METRICS}`);
  console.log(`Errors queue: ${QUEUE_NAMES.ERRORS}`);
  console.log(`Database: ${CONFIG.DATABASE_URL.split('@')[1] || 'configured'}`);

  // Validate database schema exists (fail-fast if not initialized)
  console.log('Validating database schema...');
  await validateDatabaseSchema(pool);

  // Process metrics queue
  metricsQueue.process(async (job) => {
    console.log(`Processing metrics job ${job.id} for project: ${job.data.projectKey}`);
    await metricsProcessor.process(job);
    console.log(`Completed metrics job ${job.id}`);
  });

  // Process errors queue
  errorsQueue.process(async (job) => {
    console.log(`Processing error job ${job.id} for project: ${job.data.projectKey}`);
    await errorsProcessor.process(job);
    console.log(`Completed error job ${job.id}`);
  });

  // Handle queue events
  metricsQueue.on('failed', (job, err) => {
    console.error(`Metrics job ${job.id} failed:`, err.message);
  });

  errorsQueue.on('failed', (job, err) => {
    console.error(`Errors job ${job.id} failed:`, err.message);
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('Received SIGTERM, shutting down gracefully...');
    await metricsQueue.close();
    await errorsQueue.close();
    await pool.end();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('Received SIGINT, shutting down gracefully...');
    await metricsQueue.close();
    await errorsQueue.close();
    await pool.end();
    process.exit(0);
  });

  console.log('Workers started and ready to process jobs');
}

// Start workers
bootstrap()
  .then(() => {
    console.log('Worker service running');
  })
  .catch((error) => {
    console.error('Failed to start workers:', error);
    process.exit(1);
  });

