import { Router, Response } from 'express';
import type { AuthenticatedRequest } from '../middleware';
import { ingestSchema } from '../validation/schemas';
import type { QueueService } from '../services/QueueService';
import type { IngestRequest } from '../types';

export function createIngestRouter(queueService: QueueService): Router {
  const router = Router();

  /**
   * Ingest performance events
   */
  router.post('/ingest', async (req: AuthenticatedRequest, res: Response) => {
    // Validate request
    const { error, value } = ingestSchema.validate(req.body, {
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
      await queueService.addMetrics(value as IngestRequest);
      return res.status(202).json({ accepted: true });
    } catch (err) {
      console.error('Error queueing metrics:', err);
      return res.status(500).json({ error: 'Queueing failed' });
    }
  });

  return router;
}

