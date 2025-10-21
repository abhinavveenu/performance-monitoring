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
    // Validate inputs
    if (!projectKey) {
      throw new Error('Project key is required');
    }

    if (!timeRange) {
      throw new Error('Time range is required');
    }

    if (!dimension) {
      throw new Error('Dimension is required');
    }

    // Fetch all data in parallel with timeout
    const fetchWithTimeout = (url: string, timeout = 10000): Promise<Response> => {
      return Promise.race([
        fetch(url),
        new Promise<Response>((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout')), timeout)
        ),
      ]);
    };

    const [summaryRes, timeseriesRes, pagesRes, breakdownRes] = await Promise.all([
      fetchWithTimeout(`${QUERY_API_URL}/api/projects/${projectKey}/metrics/summary?range=${timeRange}`),
      fetchWithTimeout(`${QUERY_API_URL}/api/projects/${projectKey}/metrics/timeseries?range=${timeRange}&interval=${interval}`),
      fetchWithTimeout(`${QUERY_API_URL}/api/projects/${projectKey}/pages?limit=10`),
      fetchWithTimeout(`${QUERY_API_URL}/api/projects/${projectKey}/breakdown/${dimension}?range=${timeRange}`),
    ]);

    // Check for errors with detailed messages
    const errors: string[] = [];
    if (!summaryRes.ok) errors.push(`Summary: ${summaryRes.status} ${summaryRes.statusText}`);
    if (!timeseriesRes.ok) errors.push(`Timeseries: ${timeseriesRes.status} ${timeseriesRes.statusText}`);
    if (!pagesRes.ok) errors.push(`Pages: ${pagesRes.status} ${pagesRes.statusText}`);
    if (!breakdownRes.ok) errors.push(`Breakdown: ${breakdownRes.status} ${breakdownRes.statusText}`);

    if (errors.length > 0) {
      throw new Error(`Failed to fetch dashboard data: ${errors.join(', ')}`);
    }

    // Parse responses with error handling
    const [summary, timeseries, pages, breakdown] = await Promise.all([
      summaryRes.json().catch(err => {
        console.error('Failed to parse summary response:', err);
        throw new Error('Invalid summary data format');
      }),
      timeseriesRes.json().catch(err => {
        console.error('Failed to parse timeseries response:', err);
        throw new Error('Invalid timeseries data format');
      }),
      pagesRes.json().catch(err => {
        console.error('Failed to parse pages response:', err);
        throw new Error('Invalid pages data format');
      }),
      breakdownRes.json().catch(err => {
        console.error('Failed to parse breakdown response:', err);
        throw new Error('Invalid breakdown data format');
      }),
    ]);

    return {
      summary,
      timeseries,
      pages,
      breakdown,
    };
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('Network error - Query API may be down:', error);
      throw new Error('Unable to connect to Query API. Please check if the service is running.');
    }
    
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
}

