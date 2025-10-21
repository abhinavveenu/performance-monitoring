import { useState, useEffect, useCallback } from 'react';
import { fetchDashboardData, type DashboardData } from '../services/api';
import { API_CONFIG } from '../constants/config';

interface UseDashboardDataResult {
  data: DashboardData | null;
  loading: boolean;
  error: Error | null;
  lastUpdate: Date;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for fetching and managing dashboard data
 */
export function useDashboardData(
  projectKey: string,
  timeRange: string,
  dimension: string
): UseDashboardDataResult {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const { REFRESH_INTERVAL } = API_CONFIG;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const dashboardData = await fetchDashboardData(projectKey, timeRange, dimension);
      
      // Validate response data
      if (!dashboardData) {
        throw new Error('No data received from API');
      }

      if (!dashboardData.summary) {
        console.warn('Missing summary data in response');
      }

      if (!dashboardData.timeseries || !Array.isArray(dashboardData.timeseries)) {
        console.warn('Missing or invalid timeseries data in response');
      }

      setData(dashboardData);
      setLastUpdate(new Date());
      setError(null); // Clear any previous errors on success
    } catch (err) {
      const error = err as Error;
      console.error('Error fetching dashboard data:', error);
      
      // Create user-friendly error message
      let errorMessage = error.message;
      if (error.message.includes('Query API')) {
        errorMessage = 'Unable to connect to the Query API. Please ensure the service is running.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Request timed out. Please try again.';
      } else if (error.message.includes('format')) {
        errorMessage = 'Received invalid data format from server.';
      }

      setError(new Error(errorMessage));
      
      // Don't clear data on error - keep showing stale data
      // This provides a better user experience
    } finally {
      setLoading(false);
    }
  }, [projectKey, timeRange, dimension]);

  // Fetch data on mount and when dependencies change
  useEffect(() => {
    fetchData();

    // Set up auto-refresh interval
    const intervalId = setInterval(fetchData, REFRESH_INTERVAL);

    return () => {
      clearInterval(intervalId);
    };
  }, [fetchData, REFRESH_INTERVAL]);

  return {
    data,
    loading,
    error,
    lastUpdate,
    refetch: fetchData,
  };
}

