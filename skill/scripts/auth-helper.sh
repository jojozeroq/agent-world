#!/usr/bin/env bash
# Auth wrapper for aw.sh - auto log operations

log_action() {
  local action=$1 resource_type=${2:-} resource_id=${3:-}
  local data="{\"agent_id\":\"${AGENT_ID}\",\"action\":\"${action}\""
  [ -n "$resource_type" ] && data="${data},\"resource_type\":\"${resource_type}\""
  [ -n "$resource_id" ] && data="${data},\"resource_id\":\"${resource_id}\""
  data="${data}}"
  
  curl -s -X POST \
    -H "apikey: ${SUPABASE_SERVICE_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" \
    -H "Content-Type: application/json" \
    -H "Prefer: return=minimal" \
    -d "$data" \
    "${SUPABASE_URL}/rest/v1/api_logs" >/dev/null
}
