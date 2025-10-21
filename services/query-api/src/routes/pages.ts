import express from 'express';
import { MetricsService } from '../services/metrics.js';

export function createPageRoutes(metricsService: MetricsService) {
  const router = express.Router();

  /**
   * GET /api/pages/:pageId/metrics
   * Get detailed metrics for a specific page
   */
  router.get('/:pageId/metrics', async (req, res, next) => {
    try {
      const pageId = parseInt(req.params.pageId);
      const range = parseTimeRange(req.query.range as string);

      const metrics = await metricsService.getPageMetrics(pageId, range);
      res.json(metrics);
    } catch (error) {
      next(error);
    }
  });

  return router;
}

/**
 * Parse time range from query parameter
 */
function parseTimeRange(rangeStr: string = '24h'): { from: Date; to: Date } {
  const to = new Date();
  const from = new Date();

  const match = rangeStr.match(/^(\d+)([hdw])$/);
  if (match) {
    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 'h':
        from.setHours(from.getHours() - value);
        break;
      case 'd':
        from.setDate(from.getDate() - value);
        break;
      case 'w':
        from.setDate(from.getDate() - value * 7);
        break;
    }
  } else {
    from.setHours(from.getHours() - 24);
  }

  return { from, to };
}

