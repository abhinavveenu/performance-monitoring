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
let queueService: QueueService;
try {
  queueService = new QueueService(CONFIG.REDIS_URL);
  console.log('Queue service initialized successfully');
} catch (error) {
  console.error('Failed to initialize queue service:', error);
  console.error('Please ensure Redis is running and REDIS_URL is correct');
  process.exit(1);
}

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
  
  // Check if response already sent
  if (res.headersSent) {
    return;
  }

  // Determine status code
  const statusCode = (err as any).status || (err as any).statusCode || 500;
  const message = CONFIG.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message || 'Internal server error';

  res.status(statusCode).json({ 
    error: message,
    ...(CONFIG.NODE_ENV !== 'production' && { stack: err.stack }),
  });
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
const server = app.listen(CONFIG.PORT, () => {
  console.log(`Ingestion API listening on :${CONFIG.PORT}`);
  console.log(`Environment: ${CONFIG.NODE_ENV}`);
  console.log(`Redis: ${CONFIG.REDIS_URL}`);
});

// Handle server errors
server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${CONFIG.PORT} is already in use`);
  } else {
    console.error('Server error:', error);
  }
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Give time to flush logs before exiting
  setTimeout(() => process.exit(1), 1000);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

