#!/bin/bash
# Run database migration via Supabase SQL Editor API

MIGRATION_FILE="${1:-supabase/migrations/20260304_auth_system.sql}"

if [ ! -f "$MIGRATION_FILE" ]; then
  echo "Migration file not found: $MIGRATION_FILE"
  exit 1
fi

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_KEY" ]; then
  echo "Missing SUPABASE_URL or SUPABASE_SERVICE_KEY"
  exit 1
fi

echo "Running migration: $MIGRATION_FILE"

# Read SQL file and execute via REST API
SQL=$(cat "$MIGRATION_FILE")

curl -X POST "${SUPABASE_URL}/rest/v1/rpc/exec_sql" \
  -H "Content-Type: application/json" \
  -H "apikey: ${SUPABASE_SERVICE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" \
  -d "{\"query\": $(echo "$SQL" | jq -Rs .)}"

echo ""
echo "Migration completed"
