import { Router, Request, Response } from 'express';

const router = Router();

/**
 * Lighthouse webhook endpoint (placeholder)
 * TODO: Implement Lighthouse report processing
 */
router.post('/lighthouse', (req: Request, res: Response) => {
  console.log('Received Lighthouse webhook:', {
    ...req.body,
    // Don't log full report to avoid spam
    report: req.body.report ? '[Report received]' : undefined,
  });
  
  res.status(202).json({ accepted: true });
});

export default router;

