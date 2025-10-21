import type { Request, Response, NextFunction } from 'express';

/**
 * Extended request with project key
 */
export interface AuthenticatedRequest extends Request {
  projectKey?: string;
}

/**
 * API key authentication middleware
 */
export function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const apiKey = req.header('x-api-key');
  
  if (!apiKey) {
    res.status(401).json({ error: 'Missing API key' });
    return;
  }

  // TODO: Verify API key against database
  // For now, accept any non-empty key
  
  // Extract project key from request body or query
  req.projectKey = (req.body && req.body.projectKey) || req.query.projectKey as string;
  
  next();
}

