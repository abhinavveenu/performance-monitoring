import express from 'express';
import { MetricsService } from '../services/metrics.js';

export function createSessionRoutes(metricsService: MetricsService) {
  const router = express.Router();

  /**
   * GET /api/sessions/:sessionId/journey
   * Get user journey for a session
   */
  router.get('/:sessionId/journey', async (req, res, next) => {
    try {
      const { sessionId } = req.params;
      const journey = await metricsService.getSessionJourney(sessionId);
      res.json(journey);
    } catch (error) {
      next(error);
    }
  });

  /**
   * GET /api/sessions/:sessionId/errors
   * Get errors for a session
   */
  router.get('/:sessionId/errors', async (req, res, next) => {
    try {
      const { sessionId } = req.params;
      const errors = await metricsService.getSessionErrors(sessionId);
      res.json(errors);
    } catch (error) {
      next(error);
    }
  });

  return router;
}

