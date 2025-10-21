# perf-monitor-sdk

Lightweight, framework-agnostic performance monitoring SDK for tracking Core Web Vitals and custom metrics.

## Features

- Core Web Vitals: Automatic tracking of LCP, FID, CLS, INP, and TTFB
- Session Management: Built-in session tracking
- Tiny Bundle: < 5KB gzipped
- Framework Agnostic: Works with any JavaScript framework or vanilla JS
- Performance First: Zero impact on your site's performance
- Privacy Focused: GDPR compliant, no PII collected
- Configurable: Sampling, error tracking, resource timing
- Batching: Efficient batching of metrics
- TypeScript: Full TypeScript support

## Installation

```bash
npm install perf-monitor-sdk
```

Or via CDN:

```html
<script src="https://unpkg.com/perf-monitor-sdk@latest/dist/index.umd.js"></script>
```

Or install a specific version:

```bash
npm install perf-monitor-sdk@1.0.0
```

## Quick Start

### ES Modules

```typescript
import { PerfMonitor } from 'perf-monitor-sdk';

PerfMonitor.init({
  projectKey: 'your-project-key',
  apiKey: 'your-api-key',
  endpoint: 'https://api.yoursite.com',
});
```

### CommonJS

```javascript
const { PerfMonitor } = require('perf-monitor-sdk');

PerfMonitor.init({
  projectKey: 'your-project-key',
  apiKey: 'your-api-key',
  endpoint: 'https://api.yoursite.com',
});
```

### Script Tag (UMD)

```html
<script src="https://unpkg.com/perf-monitor-sdk@latest/dist/index.umd.js"></script>
<script>
  PerfMonitor.PerfMonitor.init({
    projectKey: 'your-project-key',
    apiKey: 'your-api-key',
    endpoint: 'https://api.yoursite.com',
  });
</script>
```

## Configuration

### Full Configuration Options

```typescript
interface PerfMonitorConfig {
  // Required
  projectKey: string;        // Your project identifier
  apiKey: string;            // API authentication key
  endpoint: string;          // API endpoint (e.g., https://api.example.com)

  // Optional
  sampleRate?: number;              // Sample rate 0-1 (default: 1.0 = 100%)
  enableErrorTracking?: boolean;     // Track JavaScript errors (default: true)
  enableResourceTiming?: boolean;    // Track resource loading (default: true)
  flushIntervalMs?: number;         // Batch flush interval (default: 5000)
  maxBatchSize?: number;            // Max events per batch (default: 10)
}
```

### Example: Production Configuration

```typescript
PerfMonitor.init({
  projectKey: 'production',
  apiKey: process.env.PERF_API_KEY,
  endpoint: 'https://perf-api.mysite.com',
  sampleRate: 0.1,              // Sample 10% of users
  enableErrorTracking: true,
  enableResourceTiming: false,   // Disable to reduce data
  flushIntervalMs: 10000,       // Flush every 10s
  maxBatchSize: 20,             // Larger batches
});
```

## Framework Integration

### React

```tsx
// src/monitoring.ts
import { PerfMonitor } from '@perf-monitor/sdk';

export function initMonitoring() {
  PerfMonitor.init({
    projectKey: import.meta.env.VITE_PROJECT_KEY,
    apiKey: import.meta.env.VITE_API_KEY,
    endpoint: import.meta.env.VITE_API_ENDPOINT,
  });
}

// src/main.tsx
import { initMonitoring } from './monitoring';

initMonitoring();
```

### Next.js

```typescript
// pages/_app.tsx
import { useEffect } from 'react';
import { PerfMonitor } from '@perf-monitor/sdk';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      PerfMonitor.init({
        projectKey: process.env.NEXT_PUBLIC_PROJECT_KEY,
        apiKey: process.env.NEXT_PUBLIC_API_KEY,
        endpoint: process.env.NEXT_PUBLIC_API_ENDPOINT,
      });
    }
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;
```

### Vue.js

```typescript
// src/main.ts
import { createApp } from 'vue';
import { PerfMonitor } from '@perf-monitor/sdk';
import App from './App.vue';

// Initialize monitoring
PerfMonitor.init({
  projectKey: import.meta.env.VITE_PROJECT_KEY,
  apiKey: import.meta.env.VITE_API_KEY,
  endpoint: import.meta.env.VITE_API_ENDPOINT,
});

createApp(App).mount('#app');
```

### Vanilla JavaScript

```html
<!DOCTYPE html>
<html>
<head>
  <script type="module">
    import { PerfMonitor } from 'https://unpkg.com/perf-monitor-sdk@latest/dist/index.esm.js';
    
    PerfMonitor.init({
      projectKey: 'my-project',
      apiKey: 'my-api-key',
      endpoint: 'https://api.example.com',
    });
  </script>
</head>
<body>
  <h1>My Website</h1>
</body>
</html>
```

## What Gets Tracked?

### Core Web Vitals

The SDK automatically tracks the following Core Web Vitals:

- **LCP (Largest Contentful Paint)**: Loading performance
- **FID (First Input Delay)**: Interactivity
- **CLS (Cumulative Layout Shift)**: Visual stability
- **INP (Interaction to Next Paint)**: Responsiveness
- **TTFB (Time to First Byte)**: Server response time

### Session Information

Each metric includes:
- Unique session ID (persisted in sessionStorage)
- Page URL
- Timestamp
- User agent (automatically added by browser)

### Error Tracking (Optional)

When enabled, tracks:
- JavaScript errors
- Unhandled promise rejections
- Error messages and stack traces

### Resource Timing (Optional)

When enabled, tracks:
- Resource load times
- Resource sizes
- Resource types (script, stylesheet, image, etc.)

## Advanced Usage

### Conditional Initialization

```typescript
// Only initialize in production
if (process.env.NODE_ENV === 'production') {
  PerfMonitor.init({
    projectKey: 'production',
    apiKey: process.env.API_KEY,
    endpoint: 'https://api.example.com',
  });
}

// Or use different configs per environment
const config = {
  development: {
    projectKey: 'dev',
    endpoint: 'http://localhost:4000',
    sampleRate: 1.0,
  },
  production: {
    projectKey: 'prod',
    endpoint: 'https://api.example.com',
    sampleRate: 0.1,
  },
};

PerfMonitor.init({
  ...config[process.env.NODE_ENV],
  apiKey: process.env.API_KEY,
});
```

### Sampling Strategies

```typescript
// Sample 10% of users
PerfMonitor.init({
  projectKey: 'my-project',
  apiKey: 'my-key',
  endpoint: 'https://api.example.com',
  sampleRate: 0.1,
});

// Sample based on custom logic
const shouldSample = () => {
  // Sample 100% of logged-in users, 5% of anonymous
  return isUserLoggedIn() ? 1.0 : 0.05;
};

PerfMonitor.init({
  projectKey: 'my-project',
  apiKey: 'my-key',
  endpoint: 'https://api.example.com',
  sampleRate: shouldSample(),
});
```

## Data Privacy

The SDK is designed with privacy in mind:

- No cookies
- No cross-site tracking
- No PII collection
- Session IDs are random UUIDs
- Only collects performance metrics
- GDPR compliant


## Performance Impact

The SDK is designed to have zero impact on your site's performance:

- Loads asynchronously
- Uses `web-vitals` library (Google's official library)
- Batches metrics to reduce network requests
- Uses `keepalive` flag for reliability
- Lazy loads only when needed
- Total bundle size: < 5KB gzipped

## TypeScript Support

Full TypeScript support with type definitions included:

```typescript
import { PerfMonitor, PerfMonitorConfig } from 'perf-monitor-sdk';

const config: PerfMonitorConfig = {
  projectKey: 'my-project',
  apiKey: 'my-key',
  endpoint: 'https://api.example.com',
  sampleRate: 0.5,
  enableErrorTracking: true,
};

PerfMonitor.init(config);
```

## API Reference

### `PerfMonitor.init(config: PerfMonitorConfig)`

Initializes the performance monitoring SDK.

**Parameters:**
- `config`: Configuration object (see Configuration section)

**Returns:** `PerfMonitor` instance

**Example:**
```typescript
const monitor = PerfMonitor.init({
  projectKey: 'my-project',
  apiKey: 'my-key',
  endpoint: 'https://api.example.com',
});
```

### `PerfMonitor.instance`

Returns the singleton instance of PerfMonitor.

**Throws:** Error if not initialized

**Example:**
```typescript
const monitor = PerfMonitor.instance;
```

## Troubleshooting

### Metrics not appearing?

1. Check API endpoint: Ensure your endpoint is correct and accessible
2. Check API key: Verify your API key is valid
3. Check browser console: Look for error messages
4. Check network tab: Verify requests are being sent
5. Wait for flush: Metrics are batched and sent every 5 seconds by default

### CORS errors?

Ensure your API server has CORS configured:

```javascript
// Express.js example
app.use(cors({
  origin: 'https://yoursite.com',
  methods: ['POST'],
  allowedHeaders: ['Content-Type', 'x-api-key'],
}));
```

### TypeScript errors?

Make sure you have TypeScript definitions:

```bash
npm install --save-dev @types/node
```

## License

MIT

