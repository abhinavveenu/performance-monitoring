## Performance Monitoring Dashboard Monorepo

Real-time web vitals monitoring with Core Web Vitals (LCP, FID, CLS, INP, TTFB), Lighthouse CI integration, performance budgets, and automated alerts.

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

# 3. Start all services
./start-all.sh
```

**Access:**
- Dashboard: http://localhost:5173
- API: http://localhost:4000
- WebSocket: ws://localhost:4500

See [RUNNING.md](./RUNNING.md) for detailed instructions.

## Architecture

```
Client SDK → API (4000) → Bull Queues → Workers → TimescaleDB
                ↓
            WebSocket (4500) → Dashboard (5173)
```

## Workspace Layout

- `packages/sdk` - Framework-agnostic performance SDK
- `packages/react` - React hooks (scaffold)
- `packages/vue` - Vue composables (scaffold)
- `packages/next` - Next.js integration (scaffold)
- `services/api` - Express ingestion API with validation & rate limiting
- `services/workers` - Bull queue processors for metrics & alerts
- `services/websocket` - Socket.io real-time server with JWT auth
- `apps/dashboard` - React dashboard with Recharts
- `infra/cloudformation` - AWS deployment templates

## Development

Build SDK:
```bash
cd packages/sdk && npm run build
```

View logs:
```bash
tail -f /tmp/perf-api.log
tail -f /tmp/perf-workers.log
```

## Deployment

Deploy to AWS with CloudFormation:
```bash
./deploy.sh
```

## Features

- Real-time Web Vitals collection (LCP, FID, CLS, INP, TTFB)  
- Batching & compression for efficient data transmission  
- Express API with rate limiting & validation  
- Bull queues with Redis for async processing  
- TimescaleDB for time-series optimization  
- WebSocket real-time updates with JWT auth  
- React dashboard with live metrics  
- CloudFormation templates for AWS deployment


