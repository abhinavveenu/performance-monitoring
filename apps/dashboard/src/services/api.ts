import { API_CONFIG } from '../constants/config';
import { getTimeInterval } from '../utils/metrics';
import type { MetricsSummary, TimeSeriesPoint, Page, Breakdown } from '../types/metrics';

/**
 * Dashboard data response
 */
export interface DashboardData {
  summary: MetricsSummary;
  timeseries: TimeSeriesPoint[];
  pages: Page[];
  breakdown: Breakdown[];
}

/**
 * Fetch dashboard data from Query API
 */
export async function fetchDashboardData(
  projectKey: string,
  timeRange: string,
  dimension: string
): Promise<DashboardData> {
  const { QUERY_API_URL } = API_CONFIG;
  const interval = getTimeInterval(timeRange);

  try {
    // Fetch all data in parallel
    const [summaryRes, timeseriesRes, pagesRes, breakdownRes] = await Promise.all([
      fetch(`${QUERY_API_URL}/api/projects/${projectKey}/metrics/summary?range=${timeRange}`),
      fetch(`${QUERY_API_URL}/api/projects/${projectKey}/metrics/timeseries?range=${timeRange}&interval=${interval}`),
      fetch(`${QUERY_API_URL}/api/projects/${projectKey}/pages?limit=10`),
      fetch(`${QUERY_API_URL}/api/projects/${projectKey}/breakdown/${dimension}?range=${timeRange}`),
    ]);

    // Check for errors
    if (!summaryRes.ok || !timeseriesRes.ok || !pagesRes.ok || !breakdownRes.ok) {
      throw new Error('Failed to fetch dashboard data');
    }

    // Parse responses
    const [summary, timeseries, pages, breakdown] = await Promise.all([
      summaryRes.json(),
      timeseriesRes.json(),
      pagesRes.json(),
      breakdownRes.json(),
    ]);

    return {
      summary,
      timeseries,
      pages,
      breakdown,
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
}

