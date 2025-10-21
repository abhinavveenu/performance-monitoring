import React from 'react';
import { theme } from '../styles/theme';
import { TIME_RANGE_LABELS, AVAILABLE_PROJECTS } from '../constants/config';

interface HeaderProps {
  projectKey: string;
  timeRange: string;
  lastUpdate: Date;
  onProjectChange: (projectKey: string) => void;
  onTimeRangeChange: (range: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  projectKey,
  timeRange,
  lastUpdate,
  onProjectChange,
  onTimeRangeChange,
}) => {
  return (
    <div
      style={{
        background: theme.colors.background.secondary,
        borderBottom: `1px solid ${theme.colors.border.primary}`,
        padding: `${theme.spacing.md} ${theme.spacing.xl}`,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: theme.fontSize['2xl'],
              fontWeight: 600,
              color: theme.colors.text.primary,
            }}
          >
            Performance Monitor
          </h1>
          <p
            style={{
              margin: `${theme.spacing.xs} 0 0 0`,
              fontSize: theme.fontSize.sm,
              color: theme.colors.text.secondary,
            }}
          >
            Web Vitals Dashboard
          </p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
          {/* Project Selector */}
          <select
            value={projectKey}
            onChange={(e) => onProjectChange(e.target.value)}
            style={{
              background: theme.colors.background.tertiary,
              color: theme.colors.text.primary,
              border: `1px solid ${theme.colors.border.secondary}`,
              borderRadius: theme.borderRadius.md,
              padding: `${theme.spacing.sm} ${theme.spacing.md}`,
              fontSize: theme.fontSize.sm,
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            {AVAILABLE_PROJECTS.map((project) => (
              <option key={project.key} value={project.key}>
                {project.name}
              </option>
            ))}
          </select>

          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => onTimeRangeChange(e.target.value)}
            style={{
              background: theme.colors.background.tertiary,
              color: theme.colors.text.primary,
              border: `1px solid ${theme.colors.border.secondary}`,
              borderRadius: theme.borderRadius.md,
              padding: `${theme.spacing.sm} ${theme.spacing.md}`,
              fontSize: theme.fontSize.sm,
              cursor: 'pointer',
            }}
          >
            {Object.entries(TIME_RANGE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <div style={{ fontSize: theme.fontSize.xs, color: theme.colors.text.muted }}>
            Updated: {lastUpdate.toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
};

