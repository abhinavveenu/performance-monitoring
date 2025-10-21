# Quick Start Guide

## Installation

**📦 [View on npm](https://www.npmjs.com/package/perf-monitor-sdk)**

```bash
npm install perf-monitor-sdk
```

## Basic Usage

### 1. Initialize the SDK

```typescript
import { PerfMonitor } from 'perf-monitor-sdk';

PerfMonitor.init({
  projectKey: 'my-project',
  apiKey: 'my-api-key',
  endpoint: 'https://api.example.com',
});
```

That's it! The SDK will now automatically track Core Web Vitals.

## Framework Examples

### React (Vite)

```typescript
// src/monitoring.ts
import { PerfMonitor } from '@perf-monitor/sdk';

export function initMonitoring() {
  if (import.meta.env.PROD) {
    PerfMonitor.init({
      projectKey: import.meta.env.VITE_PROJECT_KEY || 'production',
      apiKey: import.meta.env.VITE_API_KEY || '',
      endpoint: import.meta.env.VITE_API_ENDPOINT || 'https://api.example.com',
      sampleRate: 0.1, // 10% of users
    });
  }
}

// src/main.tsx
import { initMonitoring } from './monitoring';
import { createRoot } from 'react-dom/client';
import App from './App';

initMonitoring();

createRoot(document.getElementById('root')!).render(<App />);
```

### Next.js

```typescript
// pages/_app.tsx
import { useEffect } from 'react';
import type { AppProps } from 'next/app';
import { PerfMonitor } from '@perf-monitor/sdk';

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      PerfMonitor.init({
        projectKey: process.env.NEXT_PUBLIC_PROJECT_KEY!,
        apiKey: process.env.NEXT_PUBLIC_API_KEY!,
        endpoint: process.env.NEXT_PUBLIC_API_ENDPOINT!,
      });
    }
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;
```

### Vue 3

```typescript
// src/main.ts
import { createApp } from 'vue';
import { PerfMonitor } from '@perf-monitor/sdk';
import App from './App.vue';

// Initialize monitoring
if (import.meta.env.PROD) {
  PerfMonitor.init({
    projectKey: import.meta.env.VITE_PROJECT_KEY,
    apiKey: import.meta.env.VITE_API_KEY,
    endpoint: import.meta.env.VITE_API_ENDPOINT,
  });
}

createApp(App).mount('#app');
```

### Vanilla JavaScript

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Website</title>
</head>
<body>
  <h1>Hello World</h1>

  <!-- Load from CDN -->
  <script src="https://unpkg.com/@perf-monitor/sdk@1.0.0/dist/index.umd.js"></script>
  <script>
    // Initialize
    PerfMonitor.PerfMonitor.init({
      projectKey: 'my-project',
      apiKey: 'my-api-key',
      endpoint: 'https://api.example.com',
    });
  </script>
</body>
</html>
```

## Configuration Options

```typescript
PerfMonitor.init({
  // Required
  projectKey: 'my-project',     // Your project identifier
  apiKey: 'my-api-key',         // API authentication key
  endpoint: 'https://api.com',  // API endpoint

  // Optional
  sampleRate: 0.1,              // Sample 10% of users (default: 1.0)
  enableErrorTracking: true,     // Track JS errors (default: true)
  enableResourceTiming: false,   // Track resource loads (default: true)
  flushIntervalMs: 10000,       // Flush every 10s (default: 5000)
  maxBatchSize: 20,             // Batch size (default: 10)
});
```

## What Gets Tracked?

### Automatically Tracked

- **LCP** (Largest Contentful Paint)
- **FID** (First Input Delay)
- **CLS** (Cumulative Layout Shift)
- **INP** (Interaction to Next Paint)
- **TTFB** (Time to First Byte)

### Session Information

- Unique session ID (per browser session)
- Current page URL
- Timestamp
- User agent

### Optional Tracking

- JavaScript errors (when `enableErrorTracking: true`)
- Resource timing (when `enableResourceTiming: true`)

## Environment Variables

Create a `.env` file:

```bash
# For Vite/React
VITE_PROJECT_KEY=my-project
VITE_API_KEY=my-api-key
VITE_API_ENDPOINT=https://api.example.com

# For Next.js
NEXT_PUBLIC_PROJECT_KEY=my-project
NEXT_PUBLIC_API_KEY=my-api-key
NEXT_PUBLIC_API_ENDPOINT=https://api.example.com
```

## Best Practices

### 1. Only in Production

```typescript
if (process.env.NODE_ENV === 'production') {
  PerfMonitor.init({ /* ... */ });
}
```

### 2. Use Environment Variables

```typescript
PerfMonitor.init({
  projectKey: process.env.VITE_PROJECT_KEY,
  apiKey: process.env.VITE_API_KEY,
  endpoint: process.env.VITE_API_ENDPOINT,
});
```

### 3. Sampling for High Traffic

```typescript
PerfMonitor.init({
  projectKey: 'high-traffic-site',
  apiKey: 'key',
  endpoint: 'https://api.example.com',
  sampleRate: 0.05, // Only 5% of users
});
```

### 4. Disable Features You Don't Need

```typescript
PerfMonitor.init({
  projectKey: 'my-site',
  apiKey: 'key',
  endpoint: 'https://api.example.com',
  enableResourceTiming: false, // Reduce data volume
});
```

## Troubleshooting

### Metrics not appearing?

1. Check browser console for errors
2. Verify API endpoint is correct
3. Ensure API key is valid
4. Wait for flush interval (default 5 seconds)
5. Check network tab for outgoing requests

### CORS errors?

Ensure your API server allows requests from your domain:

```javascript
// Express.js example
app.use(cors({
  origin: 'https://yoursite.com',
  methods: ['POST'],
  allowedHeaders: ['Content-Type', 'x-api-key'],
}));
```

### TypeScript errors?

Ensure types are installed:

```bash
npm install --save-dev @types/node
```

## Support

- [Full Documentation](./README.md)
- [Report Issues](https://github.com/your-org/perf-monitor/issues)
- [Discussions](https://github.com/your-org/perf-monitor/discussions)

