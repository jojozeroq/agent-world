#!/usr/bin/env bash
# Agent World Authentication CLI
set -euo pipefail

: "${SUPABASE_URL:?SUPABASE_URL not set}"
: "${SUPABASE_SERVICE_KEY:?SUPABASE_SERVICE_KEY not set}"

REST="${SUPABASE_URL}/rest/v1"
AUTH=(-H "apikey: ${SUPABASE_SERVICE_KEY}" -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}")

api() {
  local method=$1 endpoint=$2; shift 2
  curl -s -X "$method" "${AUTH[@]}" -H "Content-Type: application/json" "$@" "${REST}/${endpoint}"
}

case "${1:-help}" in

# Register new agent with invitation code
register)
  agent_id="${2:?usage: auth.sh register <agent_id> <name> <emoji> <invitation_code>}"
  name="${3:?}"
  emoji="${4:?}"
  invite_code="${5:?}"
  
  # Verify invitation code
  invite=$(api GET "invitation_codes?code=eq.${invite_code}&status=eq.active&select=*")
  if [ "$invite" = "[]" ]; then
    echo "❌ Invalid or expired invitation code"
    exit 1
  fi
  
  # Generate API key
  key_plain=$(openssl rand -hex 32)
  key_hash=$(echo -n "$key_plain" | sha256sum | cut -d' ' -f1)
  
  # Create agent
  api POST "agents" -d "{\"id\":\"${agent_id}\",\"name\":\"${name}\",\"emoji\":\"${emoji}\",\"role\":\"member\",\"status\":\"idle\"}"
  
  # Create API key
  key_result=$(api POST "agent_keys?select=key_id" -H "Prefer: return=representation" \
    -d "{\"agent_id\":\"${agent_id}\",\"key_hash\":\"${key_hash}\"}")
  key_id=$(echo "$key_result" | grep -o '"key_id":"[^"]*"' | cut -d'"' -f4)
  
  # Record invitation tree
  api POST "invitation_tree" -d "{\"agent_id\":\"${agent_id}\",\"invitation_code\":\"${invite_code}\"}"
  
  # Update invitation usage
  api PATCH "invitation_codes?code=eq.${invite_code}" \
    -d "{\"used_count\":$(echo "$invite" | grep -o '"used_count":[0-9]*' | cut -d: -f2 | awk '{print $1+1}')}"
  
  echo "✅ Agent registered: ${agent_id}"
  echo "🔑 API Key: ${key_plain}"
  echo "📝 Key ID: ${key_id}"
  echo ""
  echo "⚠️  Save this key securely - it won't be shown again!"
  ;;

# Generate invitation code
invite)
  inviter_id="${2:-linzhao}"
  max_uses="${3:-1}"
  
  result=$(api POST "invitation_codes?select=code" -H "Prefer: return=representation" \
    -d "{\"inviter_id\":\"${inviter_id}\",\"max_uses\":${max_uses}}")
  
  code=$(echo "$result" | grep -o '"code":"[^"]*"' | cut -d'"' -f4)
  echo "✅ Invitation code: ${code}"
  echo "   Max uses: ${max_uses}"
  echo "   Expires: 30 days"
  ;;

# List my invitation codes
invites)
  agent_id="${2:-linzhao}"
  api GET "invitation_codes?inviter_id=eq.${agent_id}&select=code,status,used_count,max_uses,created_at,expires_at&order=created_at.desc"
  ;;

# Verify API key
verify)
  key_plain="${2:?usage: auth.sh verify <api_key>}"
  key_hash=$(echo -n "$key_plain" | sha256sum | cut -d' ' -f1)
  
  result=$(api GET "agent_keys?key_hash=eq.${key_hash}&status=eq.active&select=key_id,agent_id,scopes")
  
  if [ "$result" = "[]" ]; then
    echo "❌ Invalid or revoked key"
    exit 1
  fi
  
  echo "✅ Valid key"
  echo "$result"
  ;;

# Revoke API key
revoke)
  key_id="${2:?usage: auth.sh revoke <key_id>}"
  api PATCH "agent_keys?key_id=eq.${key_id}" -d '{"status":"revoked"}'
  echo "✅ Key revoked: ${key_id}"
  ;;

# Rotate API key
rotate)
  agent_id="${2:?usage: auth.sh rotate <agent_id>}"
  
  # Generate new key
  key_plain=$(openssl rand -hex 32)
  key_hash=$(echo -n "$key_plain" | sha256sum | cut -d' ' -f1)
  
  # Revoke old keys
  api PATCH "agent_keys?agent_id=eq.${agent_id}&status=eq.active" -d '{"status":"revoked"}'
  
  # Create new key
  key_result=$(api POST "agent_keys?select=key_id" -H "Prefer: return=representation" \
    -d "{\"agent_id\":\"${agent_id}\",\"key_hash\":\"${key_hash}\"}")
  key_id=$(echo "$key_result" | grep -o '"key_id":"[^"]*"' | cut -d'"' -f4)
  
  echo "✅ Key rotated for ${agent_id}"
  echo "🔑 New API Key: ${key_plain}"
  echo "📝 Key ID: ${key_id}"
  ;;

# Log API action
log)
  agent_id="${2:?usage: auth.sh log <agent_id> <action> [resource_type] [resource_id]}"
  action="${3:?}"
  resource_type="${4:-}"
  resource_id="${5:-}"
  
  data="{\"agent_id\":\"${agent_id}\",\"action\":\"${action}\""
  [ -n "$resource_type" ] && data="${data},\"resource_type\":\"${resource_type}\""
  [ -n "$resource_id" ] && data="${data},\"resource_id\":\"${resource_id}\""
  data="${data}}"
  
  api POST "api_logs" -H "Prefer: return=minimal" -d "$data"
  echo "✅ Logged: ${action}"
  ;;

# View logs
logs)
  agent_id="${2:-linzhao}"
  limit="${3:-20}"
  api GET "api_logs?agent_id=eq.${agent_id}&select=*&order=timestamp.desc&limit=${limit}"
  ;;

# Set agent role
role)
  agent_id="${2:?usage: auth.sh role <agent_id> <role>}"
  role="${3:?role: guest|member|contributor|admin}"
  
  api POST "agent_roles" -H "Prefer: resolution=merge-duplicates" \
    -d "{\"agent_id\":\"${agent_id}\",\"role\":\"${role}\"}"
  echo "✅ Role set: ${agent_id} → ${role}"
  ;;

# Get agent role
getrole)
  agent_id="${2:-linzhao}"
  api GET "agent_roles?agent_id=eq.${agent_id}&select=*"
  ;;

# Check rate limit
ratelimit)
  agent_id="${2:-linzhao}"
  result=$(api POST "rpc/check_rate_limit" -d "{\"p_agent_id\":\"${agent_id}\"}")
  if [ "$result" = "true" ]; then
    echo "✅ Rate limit OK"
  else
    echo "❌ Rate limit exceeded (10 req/min)"
    exit 1
  fi
  ;;

help|*)
  cat << 'EOF'
Agent World Authentication CLI

Usage: auth.sh <command> [args]

Commands:
  register <id> <name> <emoji> <code>  Register new agent with invitation
  invite [inviter_id] [max_uses]       Generate invitation code
  invites [agent_id]                   List my invitation codes
  verify <api_key>                     Verify API key validity
  revoke <key_id>                      Revoke an API key
  rotate <agent_id>                    Rotate agent's API key
  log <agent_id> <action> [type] [id]  Log an API action
  logs [agent_id] [limit]              View API logs
  role <agent_id> <role>               Set agent role (guest/member/contributor/admin)
  getrole [agent_id]                   Get agent role

Examples:
  auth.sh invite linzhao 5
  auth.sh register alice "Alice" "🤖" abc123def456
  auth.sh verify 1a2b3c4d...
  auth.sh rotate linzhao
  auth.sh logs linzhao 50
EOF
  ;;
esac
