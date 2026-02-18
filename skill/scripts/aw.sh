#!/usr/bin/env bash
set -euo pipefail

: "${SUPABASE_URL:?SUPABASE_URL not set}"
: "${SUPABASE_SERVICE_KEY:?SUPABASE_SERVICE_KEY not set}"
: "${AGENT_ID:=linzhao}"

REST="${SUPABASE_URL}/rest/v1"
AUTH=(-H "apikey: ${SUPABASE_SERVICE_KEY}" -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}")

api() {
  local method=$1 endpoint=$2; shift 2
  curl -s -X "$method" "${AUTH[@]}" -H "Content-Type: application/json" "$@" "${REST}/${endpoint}"
}

case "${1:-help}" in

agents)
  api GET "agents?select=id,name,emoji,role,status,last_active_at&order=id"
  ;;

status)
  api PATCH "agents?id=eq.${AGENT_ID}" -d "{\"status\":\"${2:?usage: aw.sh status <idle|working|thinking|reviewing>}\",\"last_active_at\":\"$(date -u +%FT%TZ)\"}" -H "Prefer: return=representation"
  ;;

projects)
  api GET "projects?select=id,name,status,owner_agent_id,created_at&order=created_at.desc"
  ;;

project-create)
  api POST "projects" -H "Prefer: return=representation" \
    -d "{\"name\":\"${2:?usage: aw.sh project-create <name> [desc]}\",\"description\":\"${3:-}\",\"owner_agent_id\":\"${AGENT_ID}\"}"
  ;;

tasks)
  local_filter=""
  shift
  while [[ $# -gt 0 ]]; do
    case $1 in
      --project) local_filter="${local_filter}&project_id=eq.${2}"; shift 2;;
      --assignee) local_filter="${local_filter}&assignee_id=eq.${2}"; shift 2;;
      *) shift;;
    esac
  done
  api GET "tasks?select=id,title,status,priority,assignee_id,project_id,created_at&order=priority.desc,created_at.desc${local_filter}"
  ;;

task-create)
  shift; title="${1:?usage: aw.sh task-create <title> [--project id] [--assignee id] [--priority 0-3]}"
  shift; proj="" assignee="" prio=0
  while [[ $# -gt 0 ]]; do
    case $1 in
      --project) proj=$2; shift 2;; --assignee) assignee=$2; shift 2;;
      --priority) prio=$2; shift 2;; *) shift;;
    esac
  done
  body="{\"title\":\"${title}\",\"created_by\":\"${AGENT_ID}\",\"priority\":${prio}"
  [[ -n "$proj" ]] && body="${body},\"project_id\":\"${proj}\""
  [[ -n "$assignee" ]] && body="${body},\"assignee_id\":\"${assignee}\""
  body="${body}}"
  api POST "tasks" -H "Prefer: return=representation" -d "$body"
  ;;

task-update)
  api PATCH "tasks?id=eq.${2:?usage: aw.sh task-update <id> <status>}" \
    -d "{\"status\":\"${3:?status required}\",\"updated_at\":\"$(date -u +%FT%TZ)\"}" -H "Prefer: return=representation"
  ;;

task-assign)
  api PATCH "tasks?id=eq.${2:?usage: aw.sh task-assign <id> <agent_id>}" \
    -d "{\"assignee_id\":\"${3:?agent_id required}\",\"updated_at\":\"$(date -u +%FT%TZ)\"}" -H "Prefer: return=representation"
  ;;

knowledge)
  filter=""
  [[ "${2:-}" == "--tag" ]] && filter="&tags=cs.{${3}}"
  api GET "knowledge?select=id,title,tags,author_id,created_at&order=created_at.desc${filter}"
  ;;

knowledge-add)
  shift; title="${1:?usage: aw.sh knowledge-add <title> <content> [--tags t1,t2]}"
  content="${2:?content required}"; shift 2; tags="[]"
  [[ "${1:-}" == "--tags" ]] && tags="[$(echo "$2" | sed 's/,/","/g' | sed 's/^/"/;s/$/"/')]"
  api POST "knowledge" -H "Prefer: return=representation" \
    -d "{\"title\":\"${title}\",\"content\":\"${content}\",\"author_id\":\"${AGENT_ID}\",\"tags\":${tags}}"
  ;;

activities)
  limit="${3:-20}"
  [[ "${2:-}" == "--limit" ]] && limit="$3"
  api GET "activities?select=id,agent_id,action,summary,created_at&order=created_at.desc&limit=${limit}"
  ;;

log)
  api POST "activities" -H "Prefer: return=minimal" \
    -d "{\"agent_id\":\"${AGENT_ID}\",\"action\":\"${2:?usage: aw.sh log <action> <summary>}\",\"summary\":\"${3:?summary required}\"}"
  echo '{"ok":true}'
  ;;

help)
  echo "Usage: aw.sh <command>"
  echo "Commands: agents status projects project-create tasks task-create task-update task-assign knowledge knowledge-add activities log"
  ;;

*) echo "Unknown command: $1"; exit 1;;
esac
