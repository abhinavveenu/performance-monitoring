import express from 'express';
import { MetricsService } from '../services/metrics.js';

export function createProjectRoutes(metricsService: MetricsService) {
  const router = express.Router();

  /**
   * GET /api/projects/:projectKey/metrics/summary
   * Get aggregated metrics summary
   */
  router.get('/:projectKey/metrics/summary', async (req, res, next) => {
    try {
      const { projectKey } = req.params;
      const range = parseTimeRange(req.query.range as string);

      const summary = await metricsService.getProjectSummary(projectKey, range);
      res.json(summary);
    } catch (error) {
      next(error);
    }
  });

  /**
   * GET /api/projects/:projectKey/metrics/timeseries
   * Get time series data for charts
   */
  router.get('/:projectKey/metrics/timeseries', async (req, res, next) => {
    try {
      const { projectKey } = req.params;
      const range = parseTimeRange(req.query.range as string);
      const interval = (req.query.interval as string) || '1 hour';

      const timeseries = await metricsService.getTimeSeries(projectKey, range, interval);
      res.json(timeseries);
    } catch (error) {
      next(error);
    }
  });

  /**
   * GET /api/projects/:projectKey/pages
   * Get list of pages for the project
   */
  router.get('/:projectKey/pages', async (req, res, next) => {
    try {
      const { projectKey } = req.params;
      const limit = parseInt((req.query.limit as string) || '50');

      const pages = await metricsService.getProjectPages(projectKey, limit);
      res.json(pages);
    } catch (error) {
      next(error);
    }
  });

  /**
   * GET /api/projects/:projectKey/pages/slow
   * Get slowest pages
   */
  router.get('/:projectKey/pages/slow', async (req, res, next) => {
    try {
      const { projectKey } = req.params;
      const metric = (req.query.metric as string) || 'lcp';
      const limit = parseInt((req.query.limit as string) || '10');

      const slowPages = await metricsService.getSlowPages(projectKey, metric, limit);
      res.json(slowPages);
    } catch (error) {
      next(error);
    }
  });

  /**
   * GET /api/projects/:projectKey/breakdown/:dimension
   * Get metrics breakdown by device/browser/country
   */
  router.get('/:projectKey/breakdown/:dimension', async (req, res, next) => {
    try {
      const { projectKey, dimension } = req.params;
      const range = parseTimeRange(req.query.range as string);

      if (!['device_type', 'browser', 'country'].includes(dimension)) {
        return res.status(400).json({ error: 'Invalid dimension' });
      }

      const breakdown = await metricsService.getBreakdown(
        projectKey,
        dimension as any,
        range
      );
      res.json(breakdown);
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
    // Default to 24 hours
    from.setHours(from.getHours() - 24);
  }

  return { from, to };
}

