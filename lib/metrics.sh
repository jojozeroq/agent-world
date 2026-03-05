#!/usr/bin/env bash
# Metrics collection for Agent World

METRICS_FILE=".logs/metrics.json"
mkdir -p .logs

# Record metric
record_metric() {
  local name=$1
  local value=$2
  local ts=$(date +%s)
  
  echo "{\"name\":\"$name\",\"value\":$value,\"timestamp\":$ts}" >> "$METRICS_FILE"
}

# Get metric stats
get_metric() {
  local name=$1
  local since=${2:-3600}  # last hour
  local now=$(date +%s)
  local cutoff=$((now - since))
  
  grep "\"name\":\"$name\"" "$METRICS_FILE" 2>/dev/null | \
    awk -F'"timestamp":' '{print $2}' | \
    awk -F'}' '{print $1}' | \
    awk -v cutoff=$cutoff '$1 >= cutoff' | wc -l
}
