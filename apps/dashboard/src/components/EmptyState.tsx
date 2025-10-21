import React from 'react';
import { theme } from '../styles/theme';

interface EmptyStateProps {
  projectKey: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ projectKey }) => {
  return (
    <div
      style={{
        padding: `${theme.spacing.xxl} ${theme.spacing.xl}`,
        textAlign: 'center',
      }}
    >
      <div
        style={{
          color: theme.colors.text.muted,
          fontSize: theme.fontSize.lg,
        }}
      >
        No metrics data available for project "{projectKey}"
      </div>
    </div>
  );
};

