import 'dotenv/config';
import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import Redis from 'ioredis';
import Joi from 'joi';
import Bull from 'bull';

const app = express();
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '2mb' }));
app.use(morgan('combined'));

const PORT = process.env.PORT || 4000;
const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const redis = new Redis(REDIS_URL);

// queues
const metricsQueue = new Bull('metrics', REDIS_URL);
const errorsQueue = new Bull('errors', REDIS_URL);

// auth middleware
app.use((req, res, next) => {
  const apiKey = req.header('x-api-key');
  if (!apiKey) return res.status(401).json({ error: 'Missing API key' });
  // TODO: verify apiKey against DB; for scaffold accept any non-empty
  (req as any).projectKey = (req.body && req.body.projectKey) || req.query.projectKey;
  next();
});

// rate limit per project key
const limiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10000,
  keyGenerator: (req) => ((req as any).projectKey || req.ip),
});
app.use(limiter);

// validation schemas
const ingestSchema = Joi.object({
  projectKey: Joi.string().required(),
  events: Joi.array().items(
    Joi.object({
      type: Joi.string().valid('web_vital', 'resource', 'error').required(),
      name: Joi.string().required(),
      value: Joi.number().optional(),
      data: Joi.any().optional(),
      ts: Joi.number().required(),
      page: Joi.string().required(),
      sessionId: Joi.string().required(),
    })
  ).max(1000).required(),
}).required();

app.get('/v1/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/v1/ingest', async (req, res) => {
  const { error, value } = ingestSchema.validate(req.body, { abortEarly: false, allowUnknown: true });
  if (error) return res.status(400).json({ error: error.details.map((d) => d.message) });
  try {
    await metricsQueue.add(value, { removeOnComplete: true, removeOnFail: true });
    return res.status(202).json({ accepted: true });
  } catch (e) {
    return res.status(500).json({ error: 'Queueing failed' });
  }
});

app.post('/v1/errors', async (req, res) => {
  try {
    await errorsQueue.add(req.body, { removeOnComplete: true, removeOnFail: true });
    return res.status(202).json({ accepted: true });
  } catch (e) {
    return res.status(500).json({ error: 'Queueing failed' });
  }
});

// lighthouse webhook placeholder
app.post('/v1/lighthouse', (req, res) => {
  res.status(202).json({ accepted: true });
});

app.listen(PORT, () => {
  console.log(`API listening on :${PORT}`);
});


