import Bull, { Queue } from 'bull';
import { QUEUE_NAMES } from '../constants/config';
import type { IngestRequest, ErrorRequest } from '../types';

/**
 * Queue service for managing Bull queues
 */
export class QueueService {
  private metricsQueue: Queue;
  private errorsQueue: Queue;

  constructor(redisUrl: string) {
    try {
      this.metricsQueue = new Bull(QUEUE_NAMES.METRICS, redisUrl);
      this.errorsQueue = new Bull(QUEUE_NAMES.ERRORS, redisUrl);

      // Handle queue errors
      this.metricsQueue.on('error', (error) => {
        console.error('Metrics queue error:', error);
      });

      this.errorsQueue.on('error', (error) => {
        console.error('Errors queue error:', error);
      });
    } catch (error) {
      console.error('Failed to initialize queues:', error);
      throw new Error(`Queue initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Add metrics job to queue
   */
  async addMetrics(data: IngestRequest): Promise<void> {
    try {
      await this.metricsQueue.add(data, {
        removeOnComplete: true,
        removeOnFail: true,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      });
    } catch (error) {
      console.error('Failed to add metrics to queue:', error);
      throw new Error(`Failed to queue metrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Add error job to queue
   */
  async addError(data: ErrorRequest): Promise<void> {
    try {
      await this.errorsQueue.add(data, {
        removeOnComplete: true,
        removeOnFail: true,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      });
    } catch (error) {
      console.error('Failed to add error to queue:', error);
      throw new Error(`Failed to queue error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Close all queues
   */
  async close(): Promise<void> {
    try {
      await Promise.all([
        this.metricsQueue.close(),
        this.errorsQueue.close(),
      ]);
    } catch (error) {
      console.error('Error closing queues:', error);
      throw error;
    }
  }
}

