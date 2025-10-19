#!/usr/bin/env bash
set -euo pipefail

echo "Perf Monitor Deploy"
read -p "AWS Access Key ID: " AWS_ACCESS_KEY_ID
read -s -p "AWS Secret Access Key: " AWS_SECRET_ACCESS_KEY
echo
read -p "AWS Region (e.g. us-east-1): " AWS_REGION
read -p "ECR API Image URI: " API_IMAGE
read -p "ECR Workers Image URI: " WORKERS_IMAGE
read -p "ECR WebSocket Image URI: " WS_IMAGE
read -p "Redis URL: " REDIS_URL
read -p "Database URL: " DATABASE_URL

export AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY AWS_REGION

STACK_API="perf-monitor-api"
STACK_WORKERS="perf-monitor-workers"
STACK_WS="perf-monitor-ws"

aws cloudformation deploy \
  --stack-name "$STACK_API" \
  --template-file infra/cloudformation/api.yaml \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides Image=$API_IMAGE RedisUrl=$REDIS_URL DatabaseUrl=$DATABASE_URL

aws cloudformation deploy \
  --stack-name "$STACK_WORKERS" \
  --template-file infra/cloudformation/workers.yaml \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides Image=$WORKERS_IMAGE RedisUrl=$REDIS_URL DatabaseUrl=$DATABASE_URL

aws cloudformation deploy \
  --stack-name "$STACK_WS" \
  --template-file infra/cloudformation/websocket.yaml \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides Image=$WS_IMAGE

echo "Deployment triggered. Check CloudFormation stacks: $STACK_API, $STACK_WORKERS, $STACK_WS"


