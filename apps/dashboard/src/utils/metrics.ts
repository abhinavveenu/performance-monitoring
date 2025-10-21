import { METRIC_THRESHOLDS, STATUS_COLORS } from '../constants/config';
import { MetricName } from '../types/enums';

/**
 * Get color for metric value based on thresholds
 */
export function getMetricColor(metric: string, value: number): string {
  const metricName = metric.toUpperCase() as MetricName;
  const thresholds = METRIC_THRESHOLDS[metricName];
  
  if (!thresholds) {
    return STATUS_COLORS.GOOD;
  }

  if (value <= thresholds.good) {
    return STATUS_COLORS.GOOD;
  }
  
  if (value <= thresholds.needsImprovement) {
    return STATUS_COLORS.NEEDS_IMPROVEMENT;
  }
  
  return STATUS_COLORS.POOR;
}

/**
 * Format metric value with appropriate precision
 */
export function formatMetricValue(value: number, isCLS: boolean): string {
  if (isCLS) {
    return value.toFixed(3);
  }
  return Math.round(value).toString();
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get time bucket interval based on time range
 */
export function getTimeInterval(timeRange: string): string {
  switch (timeRange) {
    case '1h':
      return '1 minute';
    case '24h':
      return '1 hour';
    default:
      return '1 day';
  }
}

/**
 * Format tooltip value with unit
 */
export function formatTooltipValue(value: number, name: string): [string, string] {
  const isCLS = name.toLowerCase().includes('cls');
  const formattedValue = isCLS ? Number(value).toFixed(3) : Math.round(value).toString();
  const unit = isCLS ? '' : 'ms';
  return [formattedValue + unit, name];
}

