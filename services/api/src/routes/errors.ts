import { Router, Response } from 'express';
import type { AuthenticatedRequest } from '../middleware';
import { errorSchema } from '../validation/schemas';
import type { QueueService } from '../services/QueueService';
import type { ErrorRequest } from '../types';

export function createErrorsRouter(queueService: QueueService): Router {
  const router = Router();

  /**
   * Report JavaScript errors
   */
  router.post('/errors', async (req: AuthenticatedRequest, res: Response) => {
    // Validate request
    const { error, value } = errorSchema.validate(req.body, {
      abortEarly: false,
      allowUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map((d) => d.message),
      });
    }

    try {
      await queueService.addError(value as ErrorRequest);
      return res.status(202).json({ accepted: true });
    } catch (err) {
      console.error('Error queueing error event:', err);
      return res.status(500).json({ error: 'Queueing failed' });
    }
  });

  return router;
}

