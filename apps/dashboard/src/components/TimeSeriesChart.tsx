import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { theme } from '../styles/theme';
import { PERCENTILE_LABELS, METRIC_COLORS } from '../constants/config';
import { MetricName } from '../types/enums';
import { formatTimestamp, formatTooltipValue } from '../utils/metrics';
import type { TimeSeriesPoint } from '../types/metrics';

interface TimeSeriesChartProps {
  data: TimeSeriesPoint[];
  selectedPercentile: string;
  onPercentileChange: (percentile: string) => void;
}

export const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({
  data,
  selectedPercentile,
  onPercentileChange,
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
          Metrics Over Time
        </h3>
        <select
          value={selectedPercentile}
          onChange={(e) => onPercentileChange(e.target.value)}
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
          {Object.entries(PERCENTILE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.border.primary} />
          <XAxis
            dataKey="timestamp"
            stroke={theme.colors.text.muted}
            style={{ fontSize: theme.fontSize.xs }}
            tickFormatter={formatTimestamp}
          />
          <YAxis stroke={theme.colors.text.muted} style={{ fontSize: theme.fontSize.xs }} />
          <Tooltip
            contentStyle={{
              background: theme.colors.background.primary,
              border: `1px solid ${theme.colors.border.primary}`,
              borderRadius: theme.borderRadius.sm,
            }}
            labelStyle={{ color: theme.colors.text.primary }}
            labelFormatter={(value) => new Date(value as string).toLocaleString()}
            formatter={formatTooltipValue}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey={`lcp_${selectedPercentile}`}
            stroke={METRIC_COLORS[MetricName.LCP]}
            strokeWidth={2}
            name="LCP (ms)"
          />
          <Line
            type="monotone"
            dataKey={`fid_${selectedPercentile}`}
            stroke={METRIC_COLORS[MetricName.FID]}
            strokeWidth={2}
            name="FID (ms)"
          />
          <Line
            type="monotone"
            dataKey={`cls_${selectedPercentile}`}
            stroke={METRIC_COLORS[MetricName.CLS]}
            strokeWidth={2}
            name="CLS"
          />
          <Line
            type="monotone"
            dataKey={`inp_${selectedPercentile}`}
            stroke={METRIC_COLORS[MetricName.INP]}
            strokeWidth={2}
            name="INP (ms)"
          />
          <Line
            type="monotone"
            dataKey={`ttfb_${selectedPercentile}`}
            stroke={METRIC_COLORS[MetricName.TTFB]}
            strokeWidth={2}
            name="TTFB (ms)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

