#!/usr/bin/env bash
# Task extractor - extract tasks from text

source "$(dirname "$0")/../lib/log.sh" 2>/dev/null || true
source "$(dirname "$0")/../lib/metrics.sh" 2>/dev/null || true

extract_tasks() {
  local text="$1"
  
  log_info "Extracting tasks" 2>/dev/null || true
  
  # Simple pattern matching
  echo "$text" | grep -oE "(需要|TODO:|实现|修复|开发|完成)[^。\n]*" | \
    head -c 100 | \
    jq -R . | jq -s . 2>/dev/null || echo "[]"
  
  record_metric "tasks_extracted" 1 2>/dev/null || true
}

# Test
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
  extract_tasks "${1:-需要实现用户登录。TODO: 修复bug。}"
fi
