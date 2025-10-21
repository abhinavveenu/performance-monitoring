/**
 * Extract domain from URL
 */
export function extractDomain(url: string, fallback: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname;
  } catch {
    return fallback;
  }
}

/**
 * Extract path from URL
 */
export function extractPath(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.pathname;
  } catch {
    return url;
  }
}

