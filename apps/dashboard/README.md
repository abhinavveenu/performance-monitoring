# Performance Dashboard

Modern, type-safe React dashboard for monitoring Core Web Vitals metrics.

## Architecture

This dashboard follows React best practices with a well-organized, scalable structure:

```
src/
├── components/           # Reusable UI components
│   ├── Header.tsx       # Top navigation and controls
│   ├── MetricCard.tsx   # Individual metric display card
│   ├── TimeSeriesChart.tsx  # Time-based metrics visualization
│   ├── BreakdownChart.tsx   # Dimensional breakdown chart
│   ├── PagesTable.tsx   # Top pages performance table
│   ├── LoadingState.tsx # Loading indicator
│   ├── EmptyState.tsx   # No data message
│   └── index.ts         # Component exports
├── types/               # TypeScript type definitions
│   ├── metrics.ts       # Metric data interfaces
│   └── enums.ts         # Enumerations for constants
├── constants/           # Application constants
│   └── config.ts        # Configuration and static data
├── utils/               # Helper functions
│   └── metrics.ts       # Metric formatting and calculations
├── styles/              # Styling configuration
│   ├── theme.ts         # Design system theme
│   └── global.css       # Global styles
├── services/            # External service integrations
│   └── api.ts           # Query API client
├── hooks/               # Custom React hooks
│   └── useDashboardData.ts  # Dashboard data management
├── App.tsx              # Main application component
└── main.tsx             # Application entry point
```

## Key Features

### 🎯 Type Safety
- **Strongly typed** throughout with TypeScript
- Comprehensive interfaces for all data structures
- Type-safe enums for constants
- No `any` types

### 🧩 Component-Based Architecture
- **Single Responsibility Principle**: Each component does one thing well
- **Reusable components**: Easy to test and maintain
- **Props-based**: Components receive data through props
- **Separation of concerns**: UI, logic, and data separated

### 📐 Clean Code Practices
- **No hard-coding**: All constants in `constants/config.ts`
- **Centralized styling**: Theme system in `styles/theme.ts`
- **Utility functions**: Helper functions in `utils/`
- **Custom hooks**: Reusable logic in `hooks/`
- **API abstraction**: All API calls in `services/api.ts`

### 🎨 Design System
- Consistent color palette
- Standardized spacing
- Typography scale
- Theme-based styling

## Core Types

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

## Best Practices Applied

✅ **Single Responsibility Principle**: Each file has one clear purpose  
✅ **DRY (Don't Repeat Yourself)**: Reusable components and utilities  
✅ **Type Safety**: Full TypeScript coverage  
✅ **Separation of Concerns**: UI, logic, data, and styling separated  
✅ **Centralized Configuration**: All constants in one place  
✅ **Custom Hooks**: Reusable stateful logic  
✅ **Component Composition**: Small, composable components  
✅ **Clean Code**: Readable, maintainable, well-documented  

## Future Enhancements

- [ ] Add unit tests (Jest + React Testing Library)
- [ ] Add Storybook for component documentation
- [ ] Implement error boundaries
- [ ] Add accessibility improvements (ARIA labels)
- [ ] Add data export functionality
- [ ] Implement user preferences persistence
- [ ] Add dark/light theme toggle

