import 'dotenv/config';
import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import Redis from 'ioredis';
import { Pool } from 'pg';
import { createProjectRoutes } from './routes/projects.js';
import { createPageRoutes } from './routes/pages.js';
import { createSessionRoutes } from './routes/sessions.js';
import { CacheService } from './services/cache.js';
import { MetricsService } from './services/metrics.js';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(morgan('combined'));

const PORT = process.env.QUERY_PORT || 4001;
const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const DATABASE_URL = process.env.DATABASE_URL || 'postgres://perf:perf@localhost:5432/perfdb';

// Initialize services
let redis: Redis;
let pool: Pool;
let cacheService: CacheService;
let metricsService: MetricsService;

try {
  redis = new Redis(REDIS_URL);
  redis.on('error', (err) => {
    console.error('Redis connection error:', err);
  });

  pool = new Pool({ connectionString: DATABASE_URL });
  pool.on('error', (err) => {
    console.error('Database pool error:', err);
  });

  cacheService = new CacheService(redis);
  metricsService = new MetricsService(pool, cacheService);
  
  console.log('Services initialized successfully');
} catch (error) {
  console.error('Failed to initialize services:', error);
  process.exit(1);
}

// Rate limiting - more lenient for read queries
const limiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 1000, // 1000 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'query-api' });
});

// Mount routes
app.use('/api/projects', createProjectRoutes(metricsService));
app.use('/api/pages', createPageRoutes(metricsService));
app.use('/api/sessions', createSessionRoutes(metricsService));

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  
  // Check if response already sent
  if (res.headersSent) {
    return;
  }

  const statusCode = err.status || err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message || 'Internal server error';

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

const server = app.listen(PORT, () => {
  console.log(`Query API listening on :${PORT}`);
});

// Handle server errors
server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
  } else {
    console.error('Server error:', error);
  }
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing connections...');
  try {
    await redis.quit();
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, closing connections...');
  try {
    await redis.quit();
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  setTimeout(() => process.exit(1), 1000);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

