# Performance Dashboard

Modern, type-safe React dashboard for monitoring Core Web Vitals metrics.

### Performance Metrics
```typescript
interface PerfMetric {
  p50: number;  // Median
  p75: number;  // 75th percentile
  p95: number;  // 95th percentile
  p99: number;  // 99th percentile
}

interface MetricsSummary {
  lcp: PerfMetric;   // Largest Contentful Paint
  fid: PerfMetric;   // First Input Delay
  cls: PerfMetric;   // Cumulative Layout Shift
  inp: PerfMetric;   // Interaction to Next Paint
  ttfb: PerfMetric;  // Time to First Byte
  totalSamples: number;
}
```

### Enums
```typescript
enum TimeRange {
  ONE_HOUR = '1h',
  SIX_HOURS = '6h',
  TWENTY_FOUR_HOURS = '24h',
  SEVEN_DAYS = '7d',
  THIRTY_DAYS = '30d',
}

enum Percentile {
  P50 = 'p50',
  P75 = 'p75',
  P95 = 'p95',
  P99 = 'p99',
}

enum BreakdownDimension {
  DEVICE_TYPE = 'device_type',
  BROWSER = 'browser',
  COUNTRY = 'country',
}
```

## Configuration

All configuration is centralized in `constants/config.ts`:

```typescript
export const API_CONFIG = {
  QUERY_API_URL: import.meta.env.VITE_QUERY_API_URL || 'http://localhost:4001',
  PROJECT_KEY: import.meta.env.VITE_PROJECT_KEY || 'demo',
  REFRESH_INTERVAL: 10000, // 10 seconds
};
```

Environment variables (`.env`):
```bash
VITE_QUERY_API_URL=http://localhost:4001
VITE_PROJECT_KEY=demo
```

## Components

### MetricCard
Displays a single Core Web Vital metric with color-coded thresholds.

**Props:**
- `name`: Metric name (LCP, FID, etc.)
- `metric`: PerfMetric object with percentiles
- `unit`: Display unit (ms, or empty for CLS)
- `isCLS`: Boolean flag for CLS-specific formatting

### TimeSeriesChart
Line chart showing metric trends over time.

**Props:**
- `data`: Array of TimeSeriesPoint
- `selectedPercentile`: Active percentile (p50, p75, p95, p99)
- `onPercentileChange`: Callback when percentile changes

### BreakdownChart
Bar chart showing metrics by dimension (device, browser, country).

**Props:**
- `data`: Array of Breakdown data
- `selectedDimension`: Active dimension
- `onDimensionChange`: Callback when dimension changes

### PagesTable
Table showing top pages with performance metrics.

**Props:**
- `pages`: Array of Page objects

## Custom Hooks

### useDashboardData
Manages dashboard data fetching and auto-refresh.

**Parameters:**
- `timeRange`: Selected time range
- `dimension`: Selected breakdown dimension

**Returns:**
- `data`: Dashboard data (summary, timeseries, pages, breakdown)
- `loading`: Loading state
- `error`: Error object if fetch failed
- `lastUpdate`: Timestamp of last data refresh
- `refetch`: Manual refetch function

## Utility Functions

### getMetricColor
Returns color based on metric value and thresholds.

### formatMetricValue
Formats metric value with appropriate precision.

### formatTimestamp
Formats timestamp for chart display.

### getTimeInterval
Determines appropriate time bucket based on range.

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

