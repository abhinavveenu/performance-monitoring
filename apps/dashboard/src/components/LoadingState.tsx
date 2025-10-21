import React from 'react';
import { theme } from '../styles/theme';

export const LoadingState: React.FC = () => {
  return (
    <div
      style={{
        padding: `${theme.spacing.xxl} ${theme.spacing.xl}`,
        textAlign: 'center',
        color: theme.colors.text.muted,
      }}
    >
      Loading metrics...
    </div>
  );
};

