import rateLimit from 'express-rate-limit';
import type { AuthenticatedRequest } from './auth';
import { RATE_LIMIT } from '../constants/config';

/**
 * Rate limiting middleware per project key
 */
export const rateLimitMiddleware = rateLimit({
  windowMs: RATE_LIMIT.WINDOW_MS,
  limit: RATE_LIMIT.MAX_REQUESTS,
  keyGenerator: (req) => {
    const authenticatedReq = req as AuthenticatedRequest;
    return authenticatedReq.projectKey || req.ip || 'unknown';
  },
  standardHeaders: true,
  legacyHeaders: false,
});

