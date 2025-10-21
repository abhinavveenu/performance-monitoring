import React from 'react';
import { theme } from '../styles/theme';
import { formatMetricValue, getMetricColor } from '../utils/metrics';
import type { PerfMetric } from '../types/metrics';

interface MetricCardProps {
  name: string;
  metric: PerfMetric;
  unit: string;
  isCLS: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  name,
  metric,
  unit,
  isCLS,
}) => {
  const p95Value = metric.p95;
  const p50Value = metric.p50;
  const color = getMetricColor(name, p95Value);

  return (
    <div
      style={{
        background: theme.colors.background.secondary,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.lg,
        border: `1px solid ${theme.colors.border.primary}`,
      }}
    >
      <div
        style={{
          fontSize: theme.fontSize.sm,
          color: theme.colors.text.secondary,
          marginBottom: theme.spacing.sm,
        }}
      >
        {name} <span style={{ fontSize: theme.fontSize.xs }}>(P95)</span>
      </div>
      <div
        style={{
          fontSize: theme.fontSize['3xl'],
          fontWeight: 700,
          color,
        }}
      >
        {formatMetricValue(p95Value, isCLS)}
        <span style={{ fontSize: theme.fontSize.base, color: theme.colors.text.muted }}>
          {unit}
        </span>
      </div>
      <div
        style={{
          fontSize: theme.fontSize.xs,
          color: theme.colors.text.muted,
          marginTop: theme.spacing.sm,
        }}
      >
        P50: {formatMetricValue(p50Value, isCLS)}
        {unit}
      </div>
    </div>
  );
};

