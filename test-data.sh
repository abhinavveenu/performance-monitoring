#!/bin/bash

# Test script to send sample data through the complete workflow

echo "📊 Testing Performance Monitoring Dashboard"
echo ""

# Check if services are running
echo "1. Checking services..."
curl -s http://localhost:4000/v1/health | grep -q "ok" && echo "✓ Ingestion API (4000) is running" || echo "✗ Ingestion API not running"
curl -s http://localhost:4001/health | grep -q "ok" && echo "✓ Query API (4001) is running" || echo "✗ Query API not running"
echo ""

# Send test data
echo "2. Sending test metrics..."
curl -s -X POST http://localhost:4000/v1/ingest \
  -H "x-api-key: test-key" \
  -H "Content-Type: application/json" \
  -d '{
    "projectKey": "test-website",
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
curl -s "http://localhost:4001/api/projects/test-website/metrics/summary?range=24h" | jq .

echo ""
echo "5. Checking database..."
docker exec perfdashboard-postgres-1 psql -U perf -d perfdb -c "SELECT COUNT(*) FROM websites WHERE project_key = 'test-website';"
docker exec perfdashboard-postgres-1 psql -U perf -d perfdb -c "SELECT COUNT(*) FROM metrics;"

echo ""
echo "✅ Test complete!"

