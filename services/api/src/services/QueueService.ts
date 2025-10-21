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
    this.metricsQueue = new Bull(QUEUE_NAMES.METRICS, redisUrl);
    this.errorsQueue = new Bull(QUEUE_NAMES.ERRORS, redisUrl);
  }

  /**
   * Add metrics job to queue
   */
  async addMetrics(data: IngestRequest): Promise<void> {
    await this.metricsQueue.add(data, {
      removeOnComplete: true,
      removeOnFail: true,
    });
  }

  /**
   * Add error job to queue
   */
  async addError(data: ErrorRequest): Promise<void> {
    await this.errorsQueue.add(data, {
      removeOnComplete: true,
      removeOnFail: true,
    });
  }

  /**
   * Close all queues
   */
  async close(): Promise<void> {
    await this.metricsQueue.close();
    await this.errorsQueue.close();
  }
}

