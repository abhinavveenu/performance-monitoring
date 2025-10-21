import React, { useState } from 'react';
import {
  Header,
  MetricCard,
  TimeSeriesChart,
  BreakdownChart,
  PagesTable,
  LoadingState,
  EmptyState,
} from './components';
import { useDashboardData } from './hooks/useDashboardData';
import { theme } from './styles/theme';
import { API_CONFIG, METRICS_CONFIG } from './constants/config';
import { TimeRange, Percentile, BreakdownDimension } from './types/enums';

export const App: React.FC = () => {
  const [projectKey, setProjectKey] = useState<string>(API_CONFIG.DEFAULT_PROJECT_KEY);
  const [timeRange, setTimeRange] = useState<string>(TimeRange.TWENTY_FOUR_HOURS);
  const [selectedPercentile, setSelectedPercentile] = useState<string>(Percentile.P95);
  const [selectedDimension, setSelectedDimension] = useState<string>(BreakdownDimension.DEVICE_TYPE);

  const { data, loading, error, lastUpdate } = useDashboardData(projectKey, timeRange, selectedDimension);

  return (
    <div
      style={{
        fontFamily: 'system-ui, -apple-system, sans-serif',
        background: theme.colors.background.primary,
        minHeight: '100vh',
        color: theme.colors.text.primary,
      }}
    >
      <Header
        projectKey={projectKey}
        timeRange={timeRange}
        lastUpdate={lastUpdate}
        onProjectChange={setProjectKey}
        onTimeRangeChange={setTimeRange}
      />

      {/* Error Banner */}
      {error && (
        <div
          style={{
            margin: `${theme.spacing.md} ${theme.spacing.xl}`,
            padding: theme.spacing.md,
            background: '#fee',
            border: '1px solid #fcc',
            borderRadius: theme.borderRadius.md,
            color: '#c33',
          }}
        >
          <strong>Error:</strong> {error.message}
        </div>
      )}

      {loading && !data ? (
        <LoadingState />
      ) : !data?.summary ? (
        <EmptyState projectKey={projectKey} />
      ) : (
        <>
          {/* Metric Cards */}
          <div
            style={{
              padding: `${theme.spacing.xl} ${theme.spacing.xl} 0`,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: theme.spacing.md,
            }}
          >
            {METRICS_CONFIG.map((config) => {
              const metric = data.summary[config.key];
              // Type guard to ensure we have a PerfMetric
              if (typeof metric === 'number') return null;
              
              return (
                <MetricCard
                  key={config.key}
                  name={config.name}
                  metric={metric}
                  unit={config.unit}
                  isCLS={config.isCLS}
                />
              );
            })}
          </div>

          {/* Summary Stats */}
          <div
            style={{
              padding: `${theme.spacing.md} ${theme.spacing.xl}`,
              fontSize: theme.fontSize.sm,
              color: theme.colors.text.secondary,
            }}
          >
            Total Samples: <strong>{data.summary.totalSamples.toLocaleString()}</strong>
          </div>

          {/* Charts */}
          <div
            style={{
              padding: `0 ${theme.spacing.xl} ${theme.spacing.xl}`,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
              gap: theme.spacing.md,
            }}
          >
            <TimeSeriesChart
              data={data.timeseries}
              selectedPercentile={selectedPercentile}
              onPercentileChange={setSelectedPercentile}
            />

            <BreakdownChart
              data={data.breakdown}
              selectedDimension={selectedDimension}
              onDimensionChange={setSelectedDimension}
            />
          </div>

          {/* Pages Table */}
          {data.pages.length > 0 && <PagesTable pages={data.pages} />}
        </>
      )}
    </div>
  );
};

