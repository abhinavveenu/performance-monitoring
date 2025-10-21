import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { theme } from '../styles/theme';
import { DIMENSION_LABELS, METRIC_COLORS } from '../constants/config';
import { MetricName } from '../types/enums';
import type { Breakdown } from '../types/metrics';

interface BreakdownChartProps {
  data: Breakdown[];
  selectedDimension: string;
  onDimensionChange: (dimension: string) => void;
}

export const BreakdownChart: React.FC<BreakdownChartProps> = ({
  data,
  selectedDimension,
  onDimensionChange,
}) => {
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
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: theme.spacing.md,
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: theme.fontSize.base,
            fontWeight: 600,
            color: theme.colors.text.primary,
          }}
        >
          Breakdown by {DIMENSION_LABELS[selectedDimension] || selectedDimension}
        </h3>
        <select
          value={selectedDimension}
          onChange={(e) => onDimensionChange(e.target.value)}
          style={{
            background: theme.colors.background.tertiary,
            color: theme.colors.text.primary,
            border: `1px solid ${theme.colors.border.secondary}`,
            borderRadius: theme.borderRadius.md,
            padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
            fontSize: theme.fontSize.xs,
            cursor: 'pointer',
          }}
        >
          {Object.entries(DIMENSION_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.border.primary} />
          <XAxis
            dataKey="dimension_value"
            stroke={theme.colors.text.muted}
            style={{ fontSize: theme.fontSize.xs }}
          />
          <YAxis stroke={theme.colors.text.muted} style={{ fontSize: theme.fontSize.xs }} />
          <Tooltip
            contentStyle={{
              background: theme.colors.background.primary,
              border: `1px solid ${theme.colors.border.primary}`,
              borderRadius: theme.borderRadius.sm,
            }}
            labelStyle={{ color: theme.colors.text.primary }}
          />
          <Legend />
          <Bar dataKey="lcp_p95" fill={METRIC_COLORS[MetricName.LCP]} name="LCP P95" />
          <Bar dataKey="fid_p95" fill={METRIC_COLORS[MetricName.FID]} name="FID P95" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

