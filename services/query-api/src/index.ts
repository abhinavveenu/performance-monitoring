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
const redis = new Redis(REDIS_URL);
const pool = new Pool({ connectionString: DATABASE_URL });
const cacheService = new CacheService(redis);
const metricsService = new MetricsService(pool, cacheService);

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
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`Query API listening on :${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing connections...');
  await redis.quit();
  await pool.end();
  process.exit(0);
});

