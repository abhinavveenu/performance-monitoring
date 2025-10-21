#!/bin/bash

# Test script to send sample data through the complete workflow

# Load configuration from environment or use defaults
INGESTION_API_URL="${INGESTION_API_URL:-http://localhost:4000}"
QUERY_API_URL="${QUERY_API_URL:-http://localhost:4001}"
API_KEY="${API_KEY:-test-key}"
PROJECT_KEY="${PROJECT_KEY:-test-website}"

echo "Testing Performance Monitoring Dashboard"
echo ""
echo "Configuration:"
echo "  Ingestion API: $INGESTION_API_URL"
echo "  Query API: $QUERY_API_URL"
echo "  Project Key: $PROJECT_KEY"
echo ""

# Check if services are running
echo "1. Checking services..."
curl -s "$INGESTION_API_URL/v1/health" | grep -q "ok" && echo "✓ Ingestion API is running" || echo "✗ Ingestion API not running"
curl -s "$QUERY_API_URL/health" | grep -q "ok" && echo "✓ Query API is running" || echo "✗ Query API not running"
echo ""

# Send test data
echo "2. Sending test metrics..."
curl -s -X POST "$INGESTION_API_URL/v1/ingest" \
  -H "x-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "projectKey": "'"$PROJECT_KEY"'",
    "events": [
      {
        "type": "web_vital",
        "name": "LCP",
        "value": 2500,
        "ts": '$(date +%s000)',
        "page": "https://example.com/home",
        "sessionId": "session-123",
        "data": {
          "deviceType": "mobile",
          "browser": "Chrome",
          "country": "US"
        }
      },
      {
        "type": "web_vital",
        "name": "FID",
        "value": 100,
        "ts": '$(date +%s000)',
        "page": "https://example.com/home",
        "sessionId": "session-123",
        "data": {
          "deviceType": "mobile",
          "browser": "Chrome",
          "country": "US"
        }
      },
      {
        "type": "web_vital",
        "name": "CLS",
        "value": 0.05,
        "ts": '$(date +%s000)',
        "page": "https://example.com/home",
        "sessionId": "session-123",
        "data": {
          "deviceType": "mobile",
          "browser": "Chrome",
          "country": "US"
        }
      }
    ]
  }' | jq .

echo ""
echo "3. Waiting for workers to process (3 seconds)..."
sleep 3

echo ""
echo "4. Querying metrics from Query API..."
curl -s "$QUERY_API_URL/api/projects/$PROJECT_KEY/metrics/summary?range=24h" | jq .

echo ""
echo "5. Checking database..."
docker exec perfdashboard-postgres-1 psql -U perf -d perfdb -c "SELECT COUNT(*) FROM websites WHERE project_key = '$PROJECT_KEY';" 2>/dev/null || echo "Note: Docker database check skipped (not running or accessible)"
docker exec perfdashboard-postgres-1 psql -U perf -d perfdb -c "SELECT COUNT(*) FROM metrics;" 2>/dev/null || echo "Note: Docker database check skipped (not running or accessible)"

echo ""
echo "Test complete!"

