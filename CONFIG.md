# Configuration Guide

This document describes all configuration options for the Performance Monitoring Dashboard.

## Table of Contents

- [Environment Variables](#environment-variables)
- [Service-Specific Configuration](#service-specific-configuration)
- [Dashboard Configuration](#dashboard-configuration)
- [Test Website Configuration](#test-website-configuration)
- [Docker Compose Configuration](#docker-compose-configuration)

## Environment Variables

All services can be configured using environment variables. Create a `.env` file in the project root or set them in your shell.

### Database Configuration

```bash
# PostgreSQL connection string
DATABASE_URL=postgres://perf:perf@localhost:5432/perfdb
```

Default: `postgres://perf:perf@localhost:5432/perfdb`

### Redis Configuration

```bash
# Redis connection string
REDIS_URL=redis://127.0.0.1:6379
```

Default: `redis://127.0.0.1:6379`

### API Ports

```bash
# Ingestion API port
PORT=4000

# Query API port
QUERY_PORT=4001
```

Defaults: `4000` and `4001`

### Worker Configuration

```bash
# Number of concurrent workers processing metrics
METRICS_CONCURRENCY=5

# Number of concurrent workers processing errors
ERRORS_CONCURRENCY=2

# Database connection pool size
DB_POOL_SIZE=10
```

Defaults: `5`, `2`, and `10`

### Environment

```bash
# Node environment (development, production)
NODE_ENV=development
```

Default: `development`

## Service-Specific Configuration

### Ingestion API (`services/api/`)

**File:** `services/api/src/constants/config.ts`

```typescript
export const CONFIG = {
  PORT: parseInt(process.env.PORT || '4000', 10),
  REDIS_URL: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  NODE_ENV: process.env.NODE_ENV || 'development',
} as const;
```

**Rate Limiting:**
- Window: 60 seconds
- Max Requests: 10,000 per window

**Request Limits:**
- JSON Body Size: 2MB
- Max Events Per Request: 1000

### Query API (`services/query-api/`)

**File:** `services/query-api/src/constants/config.ts`

```typescript
export const CONFIG = {
  PORT: parseInt(process.env.QUERY_PORT || '4001', 10),
  REDIS_URL: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  DATABASE_URL: process.env.DATABASE_URL || 'postgres://perf:perf@localhost:5432/perfdb',
  NODE_ENV: process.env.NODE_ENV || 'development',
} as const;
```

**Cache TTL (seconds):**
- Summary: 60
- Timeseries: 60
- Pages: 120
- Breakdown: 60
- Session: 300

**Rate Limiting:**
- Window: 60 seconds
- Max Requests: 100 per window

### Workers (`services/workers/`)

**File:** `services/workers/src/constants/config.ts`

```typescript
export const CONFIG = {
  REDIS_URL: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  DATABASE_URL: process.env.DATABASE_URL || 'postgres://perf:perf@localhost:5432/perfdb',
} as const;

export const WORKER_CONFIG = {
  METRICS_CONCURRENCY: parseInt(process.env.METRICS_CONCURRENCY || '5'),
  ERRORS_CONCURRENCY: parseInt(process.env.ERRORS_CONCURRENCY || '2'),
  DB_POOL_SIZE: parseInt(process.env.DB_POOL_SIZE || '10'),
} as const;
```

## Dashboard Configuration

### Development Mode

**File:** `apps/dashboard/src/constants/config.ts`

The dashboard uses Vite environment variables (prefixed with `VITE_`):

```bash
# Query API URL
VITE_QUERY_API_URL=http://localhost:4001

# Default project key
VITE_PROJECT_KEY=demo
```

### Production Build

When building for production, these can be set:

```bash
# Build the dashboard with custom API URL
VITE_QUERY_API_URL=https://api.example.com npm run build
```

### Runtime Configuration

The dashboard config file:

```typescript
export const API_CONFIG = {
  QUERY_API_URL: import.meta.env.VITE_QUERY_API_URL || 'http://localhost:4001',
  DEFAULT_PROJECT_KEY: import.meta.env.VITE_PROJECT_KEY || 'demo',
  REFRESH_INTERVAL: 10000, // 10 seconds
} as const;
```

**Available Projects:**

Edit `apps/dashboard/src/constants/config.ts` to add or modify projects:

```typescript
export const AVAILABLE_PROJECTS = [
  { key: 'demo', name: 'Demo Project' },
  { key: 'production', name: 'Production' },
  { key: 'staging', name: 'Staging' },
] as const;
```

## Test Website Configuration

The test website SDK can be configured in two ways:

### 1. External Configuration File

**File:** `test-website/config.js`

```javascript
window.PERF_MONITOR_CONFIG = {
    apiUrl: 'http://localhost:4000/v1/ingest',
    apiKey: 'test-key',
    projectKey: 'demo',
    batchSize: 10,
    flushInterval: 5000,
};
```

Then include it before the SDK:

```html
<script src="config.js"></script>
<script src="perf-monitor.js"></script>
```

### 2. Inline Configuration

```html
<script>
window.PERF_MONITOR_CONFIG = {
    apiUrl: 'https://api.yoursite.com/v1/ingest',
    apiKey: 'your-api-key',
    projectKey: 'your-project',
    batchSize: 10,
    flushInterval: 5000,
};
</script>
<script src="perf-monitor.js"></script>
```

## Docker Compose Configuration

**File:** `docker-compose.yml`

```yaml
services:
  postgres:
    environment:
      POSTGRES_DB: perfdb
      POSTGRES_USER: perf
      POSTGRES_PASSWORD: perf
    ports:
      - "5432:5432"

  redis:
    ports:
      - "6379:6379"
```

To use different ports:

```bash
# Change PostgreSQL port
docker-compose -p perf-dashboard up -d
docker-compose exec postgres psql -U perf -d perfdb -p 5433

# Update DATABASE_URL accordingly
DATABASE_URL=postgres://perf:perf@localhost:5433/perfdb
```

## Test Data Script Configuration

**File:** `test-data.sh`

The test script supports environment variable configuration:

```bash
# Configure and run
INGESTION_API_URL=http://localhost:4000 \
QUERY_API_URL=http://localhost:4001 \
API_KEY=test-key \
PROJECT_KEY=demo \
./test-data.sh
```

Defaults:
- `INGESTION_API_URL`: `http://localhost:4000`
- `QUERY_API_URL`: `http://localhost:4001`
- `API_KEY`: `test-key`
- `PROJECT_KEY`: `test-website`

## Quick Start Examples

### Local Development (All Defaults)

```bash
# Start infrastructure
docker-compose up -d

# Initialize database
cd services/workers
npm run init-db

# Start all services (uses defaults)
cd ../..
./start-all.sh
```

### Custom Ports

```bash
# Set custom ports
export PORT=8000
export QUERY_PORT=8001

# Update dashboard to match
export VITE_QUERY_API_URL=http://localhost:8001

# Start services
./start-all.sh
```

### Production-like Setup

```bash
export NODE_ENV=production
export DATABASE_URL=postgres://user:pass@prod-db:5432/perfdb
export REDIS_URL=redis://prod-redis:6379
export METRICS_CONCURRENCY=20
export ERRORS_CONCURRENCY=10
export DB_POOL_SIZE=30

./start-all.sh
```

### Multiple Environments

**Development (.env.development):**
```bash
DATABASE_URL=postgres://perf:perf@localhost:5432/perfdb_dev
REDIS_URL=redis://localhost:6379
PORT=4000
QUERY_PORT=4001
```

**Staging (.env.staging):**
```bash
DATABASE_URL=postgres://perf:perf@staging-db:5432/perfdb
REDIS_URL=redis://staging-redis:6379
PORT=4000
QUERY_PORT=4001
```

**Production (.env.production):**
```bash
DATABASE_URL=postgres://perf:perf@prod-db:5432/perfdb
REDIS_URL=redis://prod-redis:6379
PORT=4000
QUERY_PORT=4001
METRICS_CONCURRENCY=20
DB_POOL_SIZE=30
```

Load the appropriate env file:
```bash
# Load staging config
export $(cat .env.staging | xargs)
./start-all.sh
```

## Troubleshooting

### Connection Refused Errors

If you see connection errors:

1. **Check service URLs match configuration:**
   ```bash
   echo $DATABASE_URL
   echo $REDIS_URL
   ```

2. **Verify services are running:**
   ```bash
   docker-compose ps
   nc -zv localhost 5432  # PostgreSQL
   nc -zv localhost 6379  # Redis
   ```

3. **Check port conflicts:**
   ```bash
   lsof -i :4000  # Ingestion API
   lsof -i :4001  # Query API
   ```

### Dashboard Not Connecting

1. **Verify Query API URL:**
   ```bash
   echo $VITE_QUERY_API_URL
   ```

2. **Test Query API directly:**
   ```bash
   curl http://localhost:4001/health
   ```

3. **Rebuild dashboard with correct URL:**
   ```bash
   cd apps/dashboard
   VITE_QUERY_API_URL=http://localhost:4001 npm run build
   ```

## Environment Variable Priority

Configuration is loaded in this order (highest priority first):

1. **Runtime environment variables** (set in shell)
2. **`.env` file** (if using dotenv)
3. **Default values** (hardcoded in config files)

Example:
```bash
# .env file
REDIS_URL=redis://localhost:6379

# Runtime override
REDIS_URL=redis://custom:6379 npm run dev

# Uses: redis://custom:6379 (runtime wins)
```

