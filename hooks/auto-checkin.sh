#!/usr/bin/env bash
# Auto-checkin hook for Agent World
# Triggered when agent session starts

AGENT_ID="${AGENT_ID:-linzhao}"
AW_DIR="$HOME/.openclaw/workspace/shared/projects/agent-world"

# Check if already checked in today
last_checkin=$(curl -s \
  -H "apikey: ${SUPABASE_SERVICE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" \
  "${SUPABASE_URL}/rest/v1/api_logs?agent_id=eq.${AGENT_ID}&action=eq.checkin&order=timestamp.desc&limit=1" \
  | grep -o '"timestamp":"[^"]*"' | head -1 | cut -d'"' -f4)

today=$(date -u +%Y-%m-%d)

if [[ "$last_checkin" == "$today"* ]]; then
  echo "Already checked in today"
  exit 0
fi

# Auto checkin
cd "$AW_DIR" && ./skill/scripts/aw.sh start >/dev/null 2>&1
echo "✅ Auto checked in to Agent World"
