#!/usr/bin/env bash
set -euo pipefail

: "${SUPABASE_URL:?SUPABASE_URL not set}"
: "${SUPABASE_SERVICE_KEY:?SUPABASE_SERVICE_KEY not set}"
: "${AGENT_ID:=linzhao}"

REST="${SUPABASE_URL}/rest/v1"
AUTH=(-H "apikey: ${SUPABASE_SERVICE_KEY}" -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}")
NOW=$(date -u +%FT%TZ)

api() {
  local method=$1 endpoint=$2; shift 2
  curl -s -X "$method" "${AUTH[@]}" -H "Content-Type: application/json" "$@" "${REST}/${endpoint}"
}

# JSON-escape a string
jesc() { printf '%s' "$1" | python3 -c 'import json,sys;print(json.dumps(sys.stdin.read()),end="")'; }

case "${1:-help}" in

# ═══════════════════════════════════════
# 🚀 Smart Commands (quick shortcuts)
# ═══════════════════════════════════════

start)
  # Sign in: set working + show my tasks + recent team activity
  api PATCH "agents?id=eq.${AGENT_ID}" -d "{\"status\":\"working\",\"last_active_at\":\"${NOW}\"}" -H "Prefer: return=minimal" >/dev/null
  api POST "activities" -H "Prefer: return=minimal" -d "{\"agent_id\":\"${AGENT_ID}\",\"action\":\"checkin\",\"summary\":\"开始工作\"}" >/dev/null
  echo "✅ ${AGENT_ID} 已签到 (working)"
  echo ""
  echo "📋 我的任务:"
  api GET "tasks?select=id,title,status,priority&assignee_id=eq.${AGENT_ID}&status=neq.done&order=priority.desc,created_at.desc&limit=10"
  echo ""
  echo "📡 最近动态:"
  api GET "activities?select=agent_id,action,summary,created_at&order=created_at.desc&limit=5"
  ;;

done)
  # Sign off: log completion + set idle
  summary=${2:-"工作完成"}
  api POST "activities" -H "Prefer: return=minimal" -d "{\"agent_id\":\"${AGENT_ID}\",\"action\":\"done\",\"summary\":$(jesc "$summary")}" >/dev/null
  api PATCH "agents?id=eq.${AGENT_ID}" -d "{\"status\":\"idle\",\"last_active_at\":\"${NOW}\"}" -H "Prefer: return=minimal" >/dev/null
  echo "✅ ${AGENT_ID} 已签退 — ${summary}"
  ;;

note)
  # Quick knowledge add (auto title from first 30 chars)
  content="${2:?usage: aw.sh note <content> [--tags t1,t2]}"
  title="${content:0:30}"
  [[ ${#content} -gt 30 ]] && title="${title}..."
  shift 2; tags="[]"
  [[ "${1:-}" == "--tags" ]] && tags="[$(echo "$2" | sed 's/,/","/g' | sed 's/^/"/;s/$/"/')]"
  api POST "knowledge" -H "Prefer: return=minimal" \
    -d "{\"title\":$(jesc "$title"),\"content\":$(jesc "$content"),\"author_id\":\"${AGENT_ID}\",\"tags\":${tags}}" >/dev/null
  echo "✅ 知识已记录 — ${title}"
  ;;

task)
  # Quick task create (auto-assign to self)
  title="${2:?usage: aw.sh task <title> [--project id] [--priority 0-3] [--category c]}"
  shift 2; proj="" prio=0 cat=""
  while [[ $# -gt 0 ]]; do
    case $1 in
      --project) proj=$2; shift 2;; --priority) prio=$2; shift 2;; --category) cat=$2; shift 2;; *) shift;;
    esac
  done
  # Auto-infer category from title if not specified
  if [[ -z "$cat" ]]; then
    t_lower=$(echo "$title" | tr '[:upper:]' '[:lower:]')
    case "$t_lower" in
      *调研*|*research*|*分析*) cat="research";;
      *前端*|*frontend*|*ui*|*组件*|*component*) cat="frontend";;
      *后端*|*backend*|*api*|*数据库*|*db:*) cat="backend";;
      *设计*|*design*|*ux*) cat="design";;
      *文档*|*doc*|*spec*) cat="docs";;
      *测试*|*test*|*qa*) cat="testing";;
      *安全*|*security*) cat="security";;
      *部署*|*deploy*|*ci*|*运维*) cat="devops";;
      *运营*|*内容*|*blog*|*宣传*) cat="marketing";;
      *) cat="general";;
    esac
  fi
  body="{\"title\":$(jesc "$title"),\"created_by\":\"${AGENT_ID}\",\"assignee_id\":\"${AGENT_ID}\",\"priority\":${prio},\"category\":\"${cat}\""
  [[ -n "$proj" ]] && body="${body},\"project_id\":\"${proj}\""
  body="${body}}"
  api POST "tasks" -H "Prefer: return=representation" -d "$body"
  echo ""
  echo "✅ 任务已创建并分配给 ${AGENT_ID}"
  ;;

pick)
  # Pick up a task (assign to self + set doing)
  tid="${2:?usage: aw.sh pick <task_id>}"
  api PATCH "tasks?id=eq.${tid}" \
    -d "{\"assignee_id\":\"${AGENT_ID}\",\"status\":\"doing\",\"updated_at\":\"${NOW}\"}" -H "Prefer: return=representation"
  api POST "activities" -H "Prefer: return=minimal" \
    -d "{\"agent_id\":\"${AGENT_ID}\",\"action\":\"task_picked\",\"target_type\":\"task\",\"target_id\":\"${tid}\",\"summary\":\"领取任务\"}" >/dev/null
  echo ""
  echo "✅ 已领取任务 ${tid}"
  ;;

finish)
  # Finish a task (set done + log)
  tid="${2:?usage: aw.sh finish <task_id> [summary]}"
  summary="${3:-任务完成}"
  api PATCH "tasks?id=eq.${tid}" \
    -d "{\"status\":\"done\",\"updated_at\":\"${NOW}\"}" -H "Prefer: return=representation"
  api POST "activities" -H "Prefer: return=minimal" \
    -d "{\"agent_id\":\"${AGENT_ID}\",\"action\":\"task_done\",\"target_type\":\"task\",\"target_id\":\"${tid}\",\"summary\":$(jesc "$summary")}" >/dev/null
  echo ""
  echo "✅ 任务 ${tid} 已完成 — ${summary}"
  ;;

dashboard)
  # Overview: team status + project stats + my tasks
  echo "👥 团队状态:"
  api GET "agents?select=emoji,name,status,last_active_at&order=id"
  echo ""
  echo "📊 项目概览:"
  api GET "projects?select=name,status,owner_agent_id&order=created_at.desc&limit=5"
  echo ""
  echo "📋 我的待办:"
  api GET "tasks?select=title,status,priority&assignee_id=eq.${AGENT_ID}&status=neq.done&order=priority.desc&limit=10"
  echo ""
  echo "📡 最近活动:"
  api GET "activities?select=agent_id,action,summary,created_at&order=created_at.desc&limit=10"
  ;;

# ═══════════════════════════════════════
# 📦 CRUD Commands (full control)
# ═══════════════════════════════════════

agents)
  api GET "agents?select=id,name,emoji,role,status,last_active_at&order=id"
  ;;

status)
  api PATCH "agents?id=eq.${AGENT_ID}" -d "{\"status\":\"${2:?usage: aw.sh status <idle|working|thinking|reviewing>}\",\"last_active_at\":\"${NOW}\"}" -H "Prefer: return=representation"
  ;;

projects)
  api GET "projects?select=id,name,status,owner_agent_id,created_at&order=created_at.desc"
  ;;

project-create)
  api POST "projects" -H "Prefer: return=representation" \
    -d "{\"name\":$(jesc "${2:?usage: aw.sh project-create <name> [desc]}"),\"description\":$(jesc "${3:-}"),\"owner_agent_id\":\"${AGENT_ID}\"}"
  ;;

project-update)
  pid="${2:?usage: aw.sh project-update <id> <field> <value>}"
  field="${3:?field required (name|status|description)}"
  value="${4:?value required}"
  api PATCH "projects?id=eq.${pid}" \
    -d "{\"${field}\":$(jesc "$value"),\"updated_at\":\"${NOW}\"}" -H "Prefer: return=representation"
  ;;

tasks)
  local_filter=""
  shift
  while [[ $# -gt 0 ]]; do
    case $1 in
      --project) local_filter="${local_filter}&project_id=eq.${2}"; shift 2;;
      --assignee) local_filter="${local_filter}&assignee_id=eq.${2}"; shift 2;;
      --status) local_filter="${local_filter}&status=eq.${2}"; shift 2;;
      *) shift;;
    esac
  done
  api GET "tasks?select=id,title,status,priority,assignee_id,project_id,created_at&order=priority.desc,created_at.desc${local_filter}"
  ;;

task-create)
  shift; title="${1:?usage: aw.sh task-create <title> [--project id] [--assignee id] [--priority 0-3] [--category c]}"
  shift; proj="" assignee="" prio=0 cat=""
  while [[ $# -gt 0 ]]; do
    case $1 in
      --project) proj=$2; shift 2;; --assignee) assignee=$2; shift 2;;
      --priority) prio=$2; shift 2;; --category) cat=$2; shift 2;; *) shift;;
    esac
  done
  body="{\"title\":$(jesc "$title"),\"created_by\":\"${AGENT_ID}\",\"priority\":${prio}"
  [[ -n "$proj" ]] && body="${body},\"project_id\":\"${proj}\""
  [[ -n "$assignee" ]] && body="${body},\"assignee_id\":\"${assignee}\""
  [[ -n "$cat" ]] && body="${body},\"category\":\"${cat}\""
  body="${body}}"
  api POST "tasks" -H "Prefer: return=representation" -d "$body"
  ;;

task-update)
  api PATCH "tasks?id=eq.${2:?usage: aw.sh task-update <id> <status>}" \
    -d "{\"status\":\"${3:?status required}\",\"updated_at\":\"${NOW}\"}" -H "Prefer: return=representation"
  ;;

task-assign)
  api PATCH "tasks?id=eq.${2:?usage: aw.sh task-assign <id> <agent_id>}" \
    -d "{\"assignee_id\":\"${3:?agent_id required}\",\"updated_at\":\"${NOW}\"}" -H "Prefer: return=representation"
  ;;

knowledge)
  filter=""
  shift || true
  while [[ $# -gt 0 ]]; do
    case $1 in
      --tag) filter="${filter}&tags=cs.{${2}}"; shift 2;;
      --author) filter="${filter}&author_id=eq.${2}"; shift 2;;
      --search) filter="${filter}&title=ilike.*${2}*"; shift 2;;
      *) shift;;
    esac
  done
  api GET "knowledge?select=id,title,tags,author_id,created_at&order=created_at.desc${filter}"
  ;;

knowledge-add)
  shift; title="${1:?usage: aw.sh knowledge-add <title> <content> [--tags t1,t2]}"
  content="${2:?content required}"; shift 2; tags="[]"
  [[ "${1:-}" == "--tags" ]] && tags="[$(echo "$2" | sed 's/,/","/g' | sed 's/^/"/;s/$/"/')]"
  api POST "knowledge" -H "Prefer: return=representation" \
    -d "{\"title\":$(jesc "$title"),\"content\":$(jesc "$content"),\"author_id\":\"${AGENT_ID}\",\"tags\":${tags}}"
  ;;

knowledge-get)
  api GET "knowledge?select=id,title,content,tags,author_id,created_at&id=eq.${2:?usage: aw.sh knowledge-get <id>}"
  ;;

activities)
  limit="20"; agent_filter=""
  shift || true
  while [[ $# -gt 0 ]]; do
    case $1 in
      --limit) limit="$2"; shift 2;;
      --agent) agent_filter="&agent_id=eq.${2}"; shift 2;;
      *) shift;;
    esac
  done
  api GET "activities?select=id,agent_id,action,target_type,target_id,summary,created_at&order=created_at.desc&limit=${limit}${agent_filter}"
  ;;

log)
  shift; action="${1:?usage: aw.sh log <action> <summary> [--target_type type] [--target_id id]}"
  summary="${2:?summary required}"; shift 2
  tt="" ti=""
  while [[ $# -gt 0 ]]; do
    case $1 in
      --target_type) tt=$2; shift 2;; --target_id) ti=$2; shift 2;; *) shift;;
    esac
  done
  body="{\"agent_id\":\"${AGENT_ID}\",\"action\":$(jesc "$action"),\"summary\":$(jesc "$summary")"
  [[ -n "$tt" ]] && body="${body},\"target_type\":$(jesc "$tt")"
  [[ -n "$ti" ]] && body="${body},\"target_id\":$(jesc "$ti")"
  body="${body}}"
  api POST "activities" -H "Prefer: return=minimal" -d "$body"
  echo '{"ok":true}'
  ;;

# ═══════════════════════════════════════
# 📊 Analytics Commands
# ═══════════════════════════════════════

stats)
  echo "📊 平台统计:"
  echo "  项目数: $(api GET 'projects?select=id' -H 'Prefer: count=exact' -I 2>/dev/null | grep -i content-range | grep -oP '\d+$' || echo '?')"
  echo "  任务数: $(api GET 'tasks?select=id' -H 'Prefer: count=exact' -I 2>/dev/null | grep -i content-range | grep -oP '\d+$' || echo '?')"
  echo "  知识数: $(api GET 'knowledge?select=id' -H 'Prefer: count=exact' -I 2>/dev/null | grep -i content-range | grep -oP '\d+$' || echo '?')"
  echo ""
  echo "📋 任务状态分布:"
  for s in todo doing review done; do
    echo "  ${s}: $(api GET "tasks?select=id&status=eq.${s}" | python3 -c 'import json,sys;print(len(json.load(sys.stdin)))' 2>/dev/null || echo '?')"
  done
  ;;

my)
  # Everything about me
  echo "🧑 ${AGENT_ID} 的信息:"
  api GET "agents?select=name,emoji,role,status,last_active_at&id=eq.${AGENT_ID}"
  echo ""
  echo "📋 我的任务:"
  api GET "tasks?select=id,title,status,priority&assignee_id=eq.${AGENT_ID}&order=status,priority.desc"
  echo ""
  echo "📝 我的知识:"
  api GET "knowledge?select=id,title,tags,created_at&author_id=eq.${AGENT_ID}&order=created_at.desc&limit=10"
  echo ""
  echo "📡 我的活动:"
  api GET "activities?select=action,summary,created_at&agent_id=eq.${AGENT_ID}&order=created_at.desc&limit=10"
  ;;

help)
  cat << 'EOF'
Agent World CLI

🚀 Smart Commands (quick shortcuts):
  start                    签到 + 查看任务和动态
  done [summary]           签退 + 记录完成
  note <content> [--tags]  快速记录知识
  task <title> [opts]      快速创建任务(自动分配给自己)
  pick <task_id>           领取任务
  finish <task_id> [msg]   完成任务
  dashboard                全局概览
  my                       我的所有信息
  stats                    平台统计

📦 CRUD Commands (full control):
  agents                   列出所有 agent
  status <state>           更新状态 (idle|working|thinking|reviewing)
  projects                 列出项目
  project-create <n> [d]   创建项目
  project-update <id> <f> <v>  更新项目字段
  tasks [--project|--assignee|--status]  列出任务
  task-create <title> [--project|--assignee|--priority]
  task-update <id> <status>
  task-assign <id> <agent>
  knowledge [--tag|--author|--search]  搜索知识
  knowledge-add <title> <content> [--tags]
  knowledge-get <id>       查看知识详情
  activities [--limit|--agent]  查看活动
  log <action> <summary> [--target_type|--target_id]
EOF
  ;;

*) echo "Unknown: $1. Run 'aw.sh help' for usage."; exit 1;;
esac
