import 'dotenv/config';
import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { CONFIG, LIMITS } from './constants/config';
import { authMiddleware, rateLimitMiddleware } from './middleware';
import { QueueService } from './services/QueueService';
import healthRouter from './routes/health';
import { createIngestRouter } from './routes/ingest';
import { createErrorsRouter } from './routes/errors';
import lighthouseRouter from './routes/lighthouse';

/**
 * Initialize Express app
 */
const app = express();

/**
 * Apply middleware
 */
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({ limit: LIMITS.JSON_BODY_SIZE }));
app.use(morgan(CONFIG.NODE_ENV === 'production' ? 'combined' : 'dev'));

/**
 * Initialize services
 */
const queueService = new QueueService(CONFIG.REDIS_URL);

/**
 * Public routes (no auth)
 */
app.use('/v1', healthRouter);

/**
 * Protected routes (require auth)
 */
app.use(authMiddleware);
app.use(rateLimitMiddleware);

/**
 * API routes
 */
app.use('/v1', createIngestRouter(queueService));
app.use('/v1', createErrorsRouter(queueService));
app.use('/v1', lighthouseRouter);

/**
 * 404 handler
 */
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

/**
 * Error handler
 */
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

/**
 * Graceful shutdown
 */
process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  await queueService.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('Received SIGINT, shutting down gracefully...');
  await queueService.close();
  process.exit(0);
});

/**
 * Start server
 */
app.listen(CONFIG.PORT, () => {
  console.log(`Ingestion API listening on :${CONFIG.PORT}`);
  console.log(`Environment: ${CONFIG.NODE_ENV}`);
  console.log(`Redis: ${CONFIG.REDIS_URL}`);
});

