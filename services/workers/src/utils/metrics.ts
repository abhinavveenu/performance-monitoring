import type { PerformanceEvent, PageMetrics, EventData } from '../types/events';
import { EVENT_TYPES, type MetricName } from '../constants/config';

/**
 * Aggregate events by page URL
 */
export function aggregateEventsByPage(events: PerformanceEvent[]): Map<string, PageMetrics> {
  const pageMetrics = new Map<string, PageMetrics>();

  for (const event of events) {
    const pageUrl = event.page;
    const sessionId = event.sessionId;

    if (!pageMetrics.has(pageUrl)) {
      pageMetrics.set(pageUrl, {
        pageUrl,
        sessionId,
        metrics: {},
        timestamp: event.ts,
        data: event.data || {},
      });
    }

    const pageData = pageMetrics.get(pageUrl)!;

    // Map metric names to columns
    if (event.type === EVENT_TYPES.WEB_VITAL) {
      const metricName = event.name.toLowerCase();
      const validMetrics: readonly string[] = ['cls', 'fid', 'lcp', 'inp', 'ttfb'];
      if (validMetrics.includes(metricName)) {
        const key = metricName as MetricName;
        pageData.metrics[key] = event.value;
      }
    }

    // Update timestamp to latest
    if (event.ts > pageData.timestamp) {
      pageData.timestamp = event.ts;
    }

    // Collect contextual data
    if (event.data) {
      pageData.data = { ...pageData.data, ...event.data };
    }
  }

  return pageMetrics;
}

/**
 * Extract device type from event data
 */
export function extractDeviceType(data: EventData): string | null {
  return data.deviceType || data.device || null;
}

/**
 * Extract browser from event data
 */
export function extractBrowser(data: EventData): string | null {
  if (data.browser) {
    return data.browser;
  }
  
  if (data.userAgent) {
    const match = data.userAgent.split(' ')[0];
    return match || null;
  }
  
  return null;
}

/**
 * Extract country from event data
 */
export function extractCountry(data: EventData): string | null {
  return data.country || data.geo?.country || null;
}

/**
 * Extract user ID from event data
 */
export function extractUserId(data: EventData): string | null {
  return data.userId || null;
}

