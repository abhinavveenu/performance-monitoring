# Architecture Overview

## System Design

The Performance Monitoring Dashboard implements **CQRS (Command Query Responsibility Segregation)** pattern, separating write and read operations for optimal performance and scalability.

## Components

### 1. Client SDK (`packages/sdk`)
- Framework-agnostic JavaScript SDK
- Collects Core Web Vitals (LCP, FID, CLS, INP, TTFB)
- Batches and compresses metrics before sending
- Auto-detects device type, browser, and location

### 2. Ingestion API - Port 4000 (`services/api`)
**Write-Only Service**
- Validates incoming metrics
- Rate limiting per project (10,000 req/min)
- Queues events in Redis via Bull
- Returns 202 Accepted immediately
- **Does not query database**

### 3. Query API - Port 4001 (`services/query-api`)
**Read-Only Service**
- GET endpoints only
- Redis caching layer (30s-5min TTL)
- Complex TimescaleDB aggregations
- Optimized for dashboard queries
- Rate limiting (1,000 req/min)
- **Does not write data**

### 4. Workers (`services/workers`)
**Background Processors**
- Consume Bull queue jobs
- Normalize and validate data
- Insert into TimescaleDB
- Auto-create websites and pages
- Publish to WebSocket (planned)

### 5. WebSocket Server - Port 4500 (`services/websocket`)
**Real-Time Updates**
- Socket.io server
- JWT authentication
- Room-based subscriptions (per project)
- Push notifications for new metrics (planned)

### 6. Dashboard - Port 5173 (`apps/dashboard`)
**React Frontend**
- Queries Query API for historical data
- Subscribes to WebSocket for real-time updates
- Recharts for visualization
- Time-series charts, percentiles, breakdowns

## Data Flow

### Write Path (Ingestion)

```
Client Website
    ↓ (SDK batches metrics)
Ingestion API :4000
    ↓ (validates & queues)
Redis Bull Queue
    ↓ (async processing)
Workers
    ↓ (normalize & insert)
TimescaleDB
    ↓ (broadcast - planned)
WebSocket :4500
    ↓ (real-time push)
Dashboard :5173
```

**Flow Steps:**
1. SDK collects web vitals and batches events
2. POST to Ingestion API with API key
3. API validates schema and queues in Bull
4. Returns 202 Accepted immediately
5. Workers consume queue jobs
6. Extract domain, create/update website entry
7. Extract path, create/update page entry
8. Insert normalized metrics into hypertable
9. Broadcast update via WebSocket (planned)

### Read Path (Queries)

```
Dashboard :5173
    ↓ (HTTP GET request)
Query API :4001
    ↓ (check cache)
Redis Cache
    ↓ (cache miss)
TimescaleDB
    ↓ (optimized query)
Query API :4001
    ↓ (cache result)
Redis Cache (TTL: 30s-5min)
    ↓ (return JSON)
Dashboard :5173
```

**Flow Steps:**
1. Dashboard makes GET request to Query API
2. Query API generates cache key
3. Check Redis cache
4. If cache hit, return immediately
5. If cache miss, query TimescaleDB
6. Use time_bucket() for time series
7. PERCENTILE_CONT for aggregations
8. Cache result with appropriate TTL
9. Return JSON to dashboard

## Database Schema

### Normalized Relational Design

```
websites (1) ──→ (N) pages (1) ──→ (N) metrics
                           ↓
                      (N) js_errors
```

### TimescaleDB Hypertables

**metrics** - Partitioned by `timestamp`
- Chunk interval: 1 day
- Automatic partitioning
- Compression enabled (planned)
- Continuous aggregates (planned)

**js_errors** - Partitioned by `timestamp`
- Chunk interval: 1 day
- Stores full stack traces
- Linked to sessions

### Indexes

**High-performance queries:**
- `(website_id, timestamp DESC)` - Website-level analytics
- `(page_id, timestamp DESC)` - Page-level metrics
- `(session_id)` - Session tracking
- `(device_type, browser, country)` - Context filtering

## Caching Strategy

### Cache Keys Pattern
```
{entity}:{identifier}:{operation}:{parameters}
```

Examples:
- `project:my-website:summary:24h:2024-10-21T00:00:00Z:2024-10-22T00:00:00Z`
- `project:my-website:timeseries:1hour:24h`
- `project:my-website:slow_pages:lcp:10`

### TTL Strategy

| Data Type | TTL | Reasoning |
|-----------|-----|-----------|
| Summary metrics | 60s | Changes frequently |
| Time series | 60s | Real-time charts |
| Page lists | 120s | Relatively stable |
| Slow pages | 120s | Ranking changes slowly |
| Breakdowns | 120s | Aggregated data |
| Session data | None | User-specific |

### Cache Invalidation

Currently: **Time-based expiration**

Future:
- Event-based invalidation when new data arrives
- Pattern-based deletion for project updates

## Scalability

### Horizontal Scaling

**Stateless Services (scale freely):**
- Ingestion API (multiple instances behind load balancer)
- Query API (multiple instances behind load balancer)
- Workers (multiple instances consume from same queue)

**Stateful Services:**
- Redis (cluster mode for high availability)
- TimescaleDB (read replicas for query API)
- WebSocket (sticky sessions or Redis adapter)

### Vertical Scaling

**TimescaleDB:**
- Automatic chunk compression
- Continuous aggregates for pre-computed metrics
- Partitioning by website_id (future)

**Redis:**
- Separate cache and queue instances
- Memory optimization via eviction policies

## Performance Optimizations

### Query API

1. **Caching** - Redis layer prevents repeated DB queries
2. **Indexing** - Optimized for common access patterns
3. **Aggregations** - TimescaleDB time_bucket() and percentiles
4. **Limits** - Capped result sets (1000 max for raw metrics)
5. **Async** - Non-blocking I/O with connection pooling

### Ingestion API

1. **Queueing** - Immediate response, async processing
2. **Batching** - SDK batches metrics before sending
3. **Validation** - Joi schema validation
4. **Rate limiting** - Per-project throttling

### Workers

1. **Transactions** - ACID guarantees for data integrity
2. **Batch inserts** - Group events by page
3. **Connection pooling** - Reuse DB connections
4. **Error handling** - Retry logic with exponential backoff

### TimescaleDB

1. **Hypertables** - Automatic partitioning
2. **Compression** - Reduce storage (planned)
3. **Continuous aggregates** - Pre-computed rollups (planned)
4. **Parallel queries** - Multi-core utilization

## Monitoring & Observability

### Logs
- Structured JSON logs
- Separate log files per service
- Centralized logging (planned)

### Metrics
- Request rates and latencies
- Cache hit/miss ratios
- Queue depths
- Database query performance

### Alerts
- High error rates
- Queue backlog
- Database connection failures
- Cache unavailability

## Security

### Authentication
- API key validation for ingestion
- JWT tokens for WebSocket
- Per-project rate limiting

### Data Privacy
- Anonymized user IDs
- No PII collection by default
- Session-based tracking only

### Infrastructure
- Helmet.js for HTTP security headers
- CORS configuration
- Compression enabled
- Rate limiting at multiple layers

## Future Enhancements

### Short Term
1. WebSocket broadcasting from workers
2. Continuous aggregates in TimescaleDB
3. Data retention policies
4. Alert rules engine

### Medium Term
1. Read replicas for Query API
2. Compression for old data
3. GraphQL API
4. Real-time dashboards

### Long Term
1. Multi-region deployment
2. Data warehouse integration
3. Machine learning anomaly detection
4. Custom metric support

