#!/bin/bash

# Load environment variables
export DATABASE_URL=${DATABASE_URL:-"postgres://perf:perf@localhost:5432/perfdb"}
export REDIS_URL=${REDIS_URL:-"redis://127.0.0.1:6379"}
export PORT=${PORT:-4000}
export QUERY_PORT=${QUERY_PORT:-4001}
export JWT_SECRET=${JWT_SECRET:-"devsecret"}

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting Performance Monitoring Services...${NC}"

# Start Ingestion API
echo -e "${GREEN}Starting Ingestion API on :${PORT}...${NC}"
cd services/api && npm run dev > /tmp/perf-api.log 2>&1 &
API_PID=$!

# Start Query API
echo -e "${GREEN}Starting Query API on :${QUERY_PORT}...${NC}"
cd ../query-api && npm run dev > /tmp/perf-query-api.log 2>&1 &
QUERY_API_PID=$!

# Start Workers
echo -e "${GREEN}Starting Workers...${NC}"
cd ../workers && npm run dev > /tmp/perf-workers.log 2>&1 &
WORKER_PID=$!

# Start Dashboard
echo -e "${GREEN}Starting Dashboard on :5173...${NC}"
cd ../../apps/dashboard && npm run dev > /tmp/perf-dashboard.log 2>&1 &
DASHBOARD_PID=$!

cd ../..

echo ""
echo -e "${BLUE}All services started!${NC}"
echo -e "Ingestion API:  http://localhost:${PORT}"
echo -e "Query API:      http://localhost:${QUERY_PORT}"
echo -e "Dashboard:      http://localhost:5173"
echo ""
echo -e "View logs:"
echo -e "  tail -f /tmp/perf-api.log"
echo -e "  tail -f /tmp/perf-query-api.log"
echo -e "  tail -f /tmp/perf-workers.log"
echo -e "  tail -f /tmp/perf-dashboard.log"
echo ""
echo -e "PIDs: Ingestion=$API_PID Query=$QUERY_API_PID Workers=$WORKER_PID Dashboard=$DASHBOARD_PID"
echo -e "To stop all services: kill $API_PID $QUERY_API_PID $WORKER_PID $DASHBOARD_PID"

