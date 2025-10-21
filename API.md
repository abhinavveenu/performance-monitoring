# API Documentation

## Overview

The Performance Monitoring Dashboard uses **CQRS (Command Query Responsibility Segregation)** pattern with two separate APIs:

- **Ingestion API (4000)** - Write-only, handles metric ingestion
- **Query API (4001)** - Read-only, handles data retrieval with caching

## Ingestion API (Port 4000)

### POST /v1/ingest

Ingest performance metrics from client SDK.

**Headers:**
- `x-api-key`: API key for authentication
- `Content-Type`: application/json

**Request Body:**
```json
{
  "projectKey": "my-website",
  "events": [
    {
      "type": "web_vital",
      "name": "LCP",
      "value": 2500,
      "ts": 1697894400000,
      "page": "https://example.com/home",
      "sessionId": "uuid-here",
      "data": {
        "deviceType": "mobile",
        "browser": "Chrome",
        "country": "US"
      }
    }
  ]
}
```

**Response:**
```json
{
  "accepted": true
}
```

**Rate Limits:**
- 10,000 requests per minute per project

---

### POST /v1/errors

Report JavaScript errors.

**Request Body:**
```json
{
  "projectKey": "my-website",
  "error": {
    "message": "TypeError: Cannot read property 'x' of undefined",
    "stack": "Error: ...\n  at function1 (file.js:10:5)"
  },
  "page": "https://example.com/page",
  "sessionId": "uuid-here",
  "timestamp": 1697894400000,
  "userAgent": "Mozilla/5.0...",
  "deviceType": "desktop",
  "browser": "Chrome",
  "country": "US"
}
```

---

### GET /v1/health

Health check endpoint.

**Response:**
```json
{
  "status": "ok"
}
```

## Query API (Port 4001)

All Query API endpoints are **GET only** and support caching.

### Project Metrics

#### GET /api/projects/:projectKey/metrics/summary

Get aggregated metrics summary (percentiles).

**Query Parameters:**
- `range` - Time range (default: `24h`)
  - Examples: `1h`, `6h`, `24h`, `7d`, `30d`

**Response:**
```json
{
  "lcp": {
    "p50": 1800,
    "p75": 2400,
    "p95": 3200,
    "p99": 4500
  },
  "fid": {
    "p50": 50,
    "p75": 100,
    "p95": 200,
    "p99": 350
  },
  "cls": {
    "p50": 0.05,
    "p75": 0.1,
    "p95": 0.15,
    "p99": 0.25
  },
  "inp": {
    "p50": 100,
    "p75": 150,
    "p95": 250,
    "p99": 400
  },
  "ttfb": {
    "p50": 200,
    "p75": 350,
    "p95": 600,
    "p99": 900
  },
  "totalSamples": 15234
}
```

**Cache TTL:** 60 seconds

---

#### GET /api/projects/:projectKey/metrics/timeseries

Get time series data for charts.

**Query Parameters:**
- `range` - Time range (default: `24h`)
- `interval` - Time bucket (default: `1 hour`)
  - Examples: `1 minute`, `5 minutes`, `1 hour`, `1 day`

**Response:**
```json
[
  {
    "timestamp": "2024-10-21T10:00:00Z",
    "lcp_p95": 2800,
    "fid_p95": 120,
    "cls_p95": 0.08,
    "inp_p95": 180,
    "ttfb_p95": 450
  },
  {
    "timestamp": "2024-10-21T11:00:00Z",
    "lcp_p95": 2600,
    "fid_p95": 110,
    "cls_p95": 0.07,
    "inp_p95": 170,
    "ttfb_p95": 420
  }
]
```

**Cache TTL:** 60 seconds

---

#### GET /api/projects/:projectKey/pages

Get list of pages with basic metrics.

**Query Parameters:**
- `limit` - Max results (default: `50`)

**Response:**
```json
[
  {
    "id": 123,
    "path": "/home",
    "page_name": "/home",
    "sample_count": 5234,
    "lcp_p95": 2400,
    "last_seen": "2024-10-21T15:30:00Z"
  },
  {
    "id": 124,
    "path": "/products",
    "page_name": "/products",
    "sample_count": 3421,
    "lcp_p95": 2800,
    "last_seen": "2024-10-21T15:28:00Z"
  }
]
```

**Cache TTL:** 120 seconds

---

#### GET /api/projects/:projectKey/pages/slow

Get slowest pages ranked by metric.

**Query Parameters:**
- `metric` - Metric to rank by (default: `lcp`)
  - Options: `lcp`, `fid`, `cls`, `inp`, `ttfb`
- `limit` - Max results (default: `10`)

**Response:**
```json
[
  {
    "id": 125,
    "path": "/checkout",
    "page_name": "/checkout",
    "metric_p95": 4200,
    "sample_count": 1234
  },
  {
    "id": 126,
    "path": "/cart",
    "page_name": "/cart",
    "metric_p95": 3800,
    "sample_count": 2345
  }
]
```

**Cache TTL:** 120 seconds

---

#### GET /api/projects/:projectKey/breakdown/:dimension

Get metrics breakdown by device_type, browser, or country.

**Path Parameters:**
- `dimension` - One of: `device_type`, `browser`, `country`

**Query Parameters:**
- `range` - Time range (default: `24h`)

**Response:**
```json
[
  {
    "dimension_value": "mobile",
    "sample_count": 8234,
    "lcp_p95": 3200,
    "fid_p95": 150,
    "cls_p95": 0.12
  },
  {
    "dimension_value": "desktop",
    "sample_count": 6123,
    "lcp_p95": 2400,
    "fid_p95": 80,
    "cls_p95": 0.06
  }
]
```

**Cache TTL:** 120 seconds

---

### Page Metrics

#### GET /api/pages/:pageId/metrics

Get detailed raw metrics for a specific page.

**Query Parameters:**
- `range` - Time range (default: `24h`)

**Response:**
```json
[
  {
    "timestamp": "2024-10-21T15:30:00Z",
    "lcp": 2400,
    "fid": 80,
    "cls": 0.05,
    "inp": 120,
    "ttfb": 300,
    "device_type": "mobile",
    "browser": "Chrome",
    "country": "US",
    "session_id": "uuid-123"
  }
]
```

**Limit:** 1000 most recent records

**Cache:** None (too specific)

---

### Session Analysis

#### GET /api/sessions/:sessionId/journey

Get complete user journey for a session.

**Response:**
```json
[
  {
    "timestamp": "2024-10-21T15:00:00Z",
    "path": "/home",
    "lcp": 2200,
    "fid": 60,
    "cls": 0.04,
    "inp": 100,
    "ttfb": 250,
    "device_type": "mobile",
    "browser": "Chrome"
  },
  {
    "timestamp": "2024-10-21T15:02:30Z",
    "path": "/products",
    "lcp": 2600,
    "fid": 80,
    "cls": 0.06,
    "inp": 130,
    "ttfb": 300,
    "device_type": "mobile",
    "browser": "Chrome"
  }
]
```

**Cache:** None (user-specific)

---

#### GET /api/sessions/:sessionId/errors

Get all errors that occurred in a session.

**Response:**
```json
[
  {
    "timestamp": "2024-10-21T15:01:00Z",
    "path": "/products",
    "error_message": "TypeError: Cannot read property 'x' of undefined",
    "stack_trace": "Error: ...\n  at function1 (file.js:10:5)"
  }
]
```

**Cache:** None (user-specific)

---

### Health Check

#### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "service": "query-api"
}
```

## WebSocket API (Port 4500)

Real-time updates via Socket.io.

### Connection

```javascript
import io from 'socket.io-client';

const socket = io('ws://localhost:4500', {
  auth: {
    token: 'JWT_TOKEN_HERE'
  }
});

socket.on('connected', (data) => {
  console.log('Connected to project:', data.projectKey);
});

socket.on('metrics', (data) => {
  console.log('New metrics:', data);
});
```

### Events

- `connected` - Emitted on successful connection
- `metrics` - Real-time metric updates (planned)
- `error` - Error notifications (planned)

## Error Codes

### 400 Bad Request
- Invalid request body
- Missing required fields
- Invalid query parameters

### 401 Unauthorized
- Missing API key
- Invalid API key
- Invalid JWT token (WebSocket)

### 429 Too Many Requests
- Rate limit exceeded

### 500 Internal Server Error
- Database connection error
- Redis connection error
- Queue processing error

## Rate Limiting

### Ingestion API
- 10,000 requests per minute per project key
- Keyed by `projectKey` from request body

### Query API
- 1,000 requests per minute per IP
- More lenient than ingestion API for read operations

## Best Practices

1. **Use appropriate time ranges** - Don't query more data than needed
2. **Leverage caching** - Repeated queries within cache TTL are served from Redis
3. **Batch ingestion** - SDK automatically batches metrics before sending
4. **Use WebSocket for real-time** - Don't poll Query API for live updates
5. **Monitor rate limits** - Implement exponential backoff on 429 responses

