import React from 'react';
import { theme } from '../styles/theme';
import { getMetricColor } from '../utils/metrics';
import type { Page } from '../types/metrics';

interface PagesTableProps {
  pages: Page[];
}

export const PagesTable: React.FC<PagesTableProps> = ({ pages }) => {
  if (pages.length === 0) {
    return null;
  }

  return (
    <div style={{ padding: `0 ${theme.spacing.xl} ${theme.spacing.xl}` }}>
      <div
        style={{
          background: theme.colors.background.secondary,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.lg,
          border: `1px solid ${theme.colors.border.primary}`,
        }}
      >
        <h3
          style={{
            margin: `0 0 ${theme.spacing.md} 0`,
            fontSize: theme.fontSize.base,
            fontWeight: 600,
            color: theme.colors.text.primary,
          }}
        >
          Top Pages
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${theme.colors.border.primary}` }}>
                <th
                  style={{
                    padding: `${theme.spacing.sm} ${theme.spacing.sm}`,
                    textAlign: 'left',
                    fontSize: theme.fontSize.sm,
                    color: theme.colors.text.secondary,
                    fontWeight: 500,
                  }}
                >
                  Page
                </th>
                <th
                  style={{
                    padding: `${theme.spacing.sm} ${theme.spacing.sm}`,
                    textAlign: 'right',
                    fontSize: theme.fontSize.sm,
                    color: theme.colors.text.secondary,
                    fontWeight: 500,
                  }}
                >
                  LCP P95
                </th>
                <th
                  style={{
                    padding: `${theme.spacing.sm} ${theme.spacing.sm}`,
                    textAlign: 'right',
                    fontSize: theme.fontSize.sm,
                    color: theme.colors.text.secondary,
                    fontWeight: 500,
                  }}
                >
                  Samples
                </th>
                <th
                  style={{
                    padding: `${theme.spacing.sm} ${theme.spacing.sm}`,
                    textAlign: 'left',
                    fontSize: theme.fontSize.sm,
                    color: theme.colors.text.secondary,
                    fontWeight: 500,
                  }}
                >
                  Last Seen
                </th>
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => (
                <tr key={page.id} style={{ borderBottom: `1px solid ${theme.colors.border.primary}` }}>
                  <td style={{ padding: `${theme.spacing.sm} ${theme.spacing.sm}`, fontSize: theme.fontSize.sm }}>
                    <span
                      style={{
                        background: theme.colors.background.tertiary,
                        padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                        borderRadius: theme.borderRadius.sm,
                        fontFamily: 'monospace',
                        fontSize: theme.fontSize.xs,
                        color: theme.colors.text.primary,
                      }}
                    >
                      {page.path}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: `${theme.spacing.sm} ${theme.spacing.sm}`,
                      fontSize: theme.fontSize.sm,
                      fontWeight: 600,
                      textAlign: 'right',
                      color: page.lcp_p95 ? getMetricColor('LCP', page.lcp_p95) : theme.colors.text.muted,
                    }}
                  >
                    {page.lcp_p95 ? Math.round(page.lcp_p95) : '-'}ms
                  </td>
                  <td
                    style={{
                      padding: `${theme.spacing.sm} ${theme.spacing.sm}`,
                      fontSize: theme.fontSize.sm,
                      color: theme.colors.text.secondary,
                      textAlign: 'right',
                    }}
                  >
                    {page.sample_count.toLocaleString()}
                  </td>
                  <td
                    style={{
                      padding: `${theme.spacing.sm} ${theme.spacing.sm}`,
                      fontSize: theme.fontSize.sm,
                      color: theme.colors.text.muted,
                    }}
                  >
                    {new Date(page.last_seen).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

