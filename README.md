## Performance Monitoring Dashboard

A production-ready web performance monitoring platform built with TimescaleDB, Bull queues, and Redis. Track Core Web Vitals (LCP, FID, CLS, INP, TTFB) across multiple websites, pages, devices, and browsers with time-series optimization.

## SDK Package

**Published npm Package:** [perf-monitor-sdk](https://www.npmjs.com/package/perf-monitor-sdk)

```bash
npm install perf-monitor-sdk
```

Full SDK documentation: [packages/sdk/README.md](./packages/sdk/README.md)

## Features

### Core Capabilities
- **Real-time Web Vitals** - Track LCP, FID, CLS, INP, TTFB across pages and devices
- **Multi-Website Support** - Monitor multiple websites and projects from one platform
- **Normalized Schema** - Efficient relational database design (no JSONB bloat)
- **Time-Series Optimization** - TimescaleDB hypertables with automatic partitioning
- **Context Tracking** - Segment by device type, browser, country, user, session

### Performance
- **Batching & Compression** - SDK efficiently batches metrics before sending
- **Rate Limiting** - Per-project throttling to prevent abuse
- **Async Processing** - Bull queues decouple ingestion from processing
- **Indexed Queries** - Optimized for common analytics patterns

### Visualization
- **React Dashboard** - Beautiful charts powered by Recharts
- **Auto-refresh** - Dashboard polls Query API every 10 seconds
- **Error Tracking** - JavaScript error capture with stack traces

### Infrastructure
- **Production-Ready** - Docker Compose for local dev
- **AWS Deployment** - CloudFormation templates included
- **Scalable Architecture** - Horizontal scaling ready

## Quick Start

**Prerequisites:**
- Node.js >= 18 (installed via nvm)
- Docker Desktop (for Redis + TimescaleDB)

**Start Everything:**
```bash
# 1. Start infrastructure
docker compose up -d

# 2. Install dependencies
npm install --legacy-peer-deps

# 3. Initialize database (run once)
cd services/workers && npm run init-db && cd ../..

# 4. Start all services
./start-all.sh
```

**Access:**
- Dashboard: http://localhost:5173
- Ingestion API: http://localhost:4000
- Query API: http://localhost:4001

## Architecture

```
Client SDK → Ingestion API (4000) → Bull Queues → Workers → TimescaleDB
                                                                   ↑
Dashboard (5173) ← Query API (4001) ← Redis Cache ←───────────────┘
```

**Write Path (Ingestion):**
1. Client SDK collects web vitals and sends batched metrics to Ingestion API (4000)
2. API validates, rate limits, and queues events in Redis (Bull)
3. Workers process queue jobs, normalize data, and store in TimescaleDB

**Read Path (Queries):**
1. Dashboard queries Query API (4001) for data (auto-refresh every 10s)
2. Query API checks Redis cache first (TTL: 30s-5min)
3. On cache miss, queries TimescaleDB with optimized aggregations
4. Results cached and returned to dashboard

**Database Schema:**
- `websites` - Project/website registry with domain mapping
- `pages` - Individual page paths within websites
- `metrics` - TimescaleDB hypertable for Core Web Vitals (partitioned by timestamp)
- `js_errors` - TimescaleDB hypertable for JavaScript errors (partitioned by timestamp)

## Workspace Layout

- `packages/sdk` - Framework-agnostic performance SDK
- `packages/react` - React hooks (scaffold)
- `packages/vue` - Vue composables (scaffold)
- `packages/next` - Next.js integration (scaffold)
- `services/api` - Express ingestion API (write-only, port 4000)
- `services/query-api` - Express query API (read-only, port 4001)
- `services/workers` - Bull queue processors for metrics & alerts
- `apps/dashboard` - React dashboard with Recharts (integrated with Query API)
- `infra/cloudformation` - AWS deployment templates

## Query API Endpoints

The Query API (port 4001) provides read-only access to performance data with intelligent caching.

### Project Metrics

```bash
# Get aggregated metrics summary (P50, P75, P95, P99)
GET /api/projects/{projectKey}/metrics/summary?range=24h

# Get time series data for charts
GET /api/projects/{projectKey}/metrics/timeseries?range=24h&interval=1hour

# Get list of pages
GET /api/projects/{projectKey}/pages?limit=50

# Get slowest pages
GET /api/projects/{projectKey}/pages/slow?metric=lcp&limit=10

# Get metrics breakdown by dimension
GET /api/projects/{projectKey}/breakdown/device_type?range=24h
GET /api/projects/{projectKey}/breakdown/browser?range=24h
GET /api/projects/{projectKey}/breakdown/country?range=24h
```

### Page Metrics

```bash
# Get detailed metrics for a specific page
GET /api/pages/{pageId}/metrics?range=1h
```

### Session Analysis

```bash
# Get user journey for a session
GET /api/sessions/{sessionId}/journey

# Get errors for a session
GET /api/sessions/{sessionId}/errors
```

### Query Parameters

- `range` - Time range: `1h`, `6h`, `24h`, `7d`, `30d`
- `interval` - Time bucket: `1 minute`, `5 minutes`, `1 hour`, `1 day`
- `limit` - Result limit (default varies by endpoint)
- `metric` - Metric name: `lcp`, `fid`, `cls`, `inp`, `ttfb`

### Caching Strategy

- **Summary metrics**: 60s TTL
- **Time series**: 60s TTL
- **Page lists**: 120s TTL
- **Slow pages**: 120s TTL
- **Breakdowns**: 120s TTL
- **Session data**: No cache (user-specific)

## Database Schema

### Websites Table
```sql
id            SERIAL PRIMARY KEY
project_key   TEXT UNIQUE (maps to SDK projectKey)
name          TEXT (website name)
domain        TEXT (extracted from page URLs)
created_at    TIMESTAMPTZ
```

### Pages Table
```sql
id            SERIAL PRIMARY KEY
website_id    INTEGER (FK to websites)
path          TEXT (e.g., /home, /products)
page_name     TEXT (optional friendly name)
created_at    TIMESTAMPTZ
UNIQUE(website_id, path)
```

### Metrics Table (Hypertable)
```sql
id               BIGSERIAL
website_id       INTEGER (FK to websites)
page_id          INTEGER (FK to pages)
timestamp        TIMESTAMPTZ (partition key)

-- Core Web Vitals
cls              REAL
fid              INTEGER (ms)
lcp              INTEGER (ms)
inp              INTEGER (ms)
ttfb             INTEGER (ms)

-- Context
device_type      TEXT (mobile, desktop, tablet)
browser          TEXT (Chrome, Firefox, Safari)
country          TEXT (US, IN, etc.)

-- User tracking
session_id       TEXT
user_id          TEXT
```

**Indexes:**
- `(website_id, timestamp DESC)` - Fast website queries
- `(page_id, timestamp DESC)` - Page-specific metrics
- `(session_id)` - Session tracking
- `(device_type, browser, country)` - Context filtering

### JS Errors Table (Hypertable)
```sql
id               BIGSERIAL
website_id       INTEGER (FK to websites)
page_id          INTEGER (FK to pages)
timestamp        TIMESTAMPTZ (partition key)
error_message    TEXT
stack_trace      TEXT
user_agent       TEXT
device_type      TEXT
browser          TEXT
country          TEXT
session_id       TEXT
```

## Configuration

All URLs and settings are configurable via environment variables. See [CONFIG.md](./CONFIG.md) for comprehensive configuration guide.

## License

MIT

