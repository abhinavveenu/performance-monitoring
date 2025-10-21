/**
 * Application theme configuration
 */
export const theme = {
  colors: {
    background: {
      primary: '#0f172a',
      secondary: '#1e293b',
      tertiary: '#334155',
    },
    text: {
      primary: '#e2e8f0',
      secondary: '#94a3b8',
      muted: '#64748b',
      inverse: '#0f172a',
    },
    border: {
      primary: '#334155',
      secondary: '#475569',
    },
    status: {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '4rem',
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '2rem',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 2px 10px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 40px rgba(0, 0, 0, 0.2)',
  },
} as const;

export type Theme = typeof theme;

