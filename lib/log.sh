#!/usr/bin/env bash
# Logging utility for Agent World

LOG_DIR=".logs"
LOG_FILE="${LOG_DIR}/aw.log"
mkdir -p "$LOG_DIR"

# Load config
[ -f .awconfig ] && source .awconfig
LOG_LEVEL=${LOG_LEVEL:-info}

log() {
  local level=$1
  shift
  local msg="$*"
  local ts=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  
  # Level priority: debug=0, info=1, warn=2, error=3
  declare -A levels=([debug]=0 [info]=1 [warn]=2 [error]=3)
  local current_level=${levels[$LOG_LEVEL]:-1}
  local msg_level=${levels[$level]:-1}
  
  [ $msg_level -ge $current_level ] && echo "[$ts] [$level] $msg" >> "$LOG_FILE"
}

log_debug() { log debug "$@"; }
log_info() { log info "$@"; }
log_warn() { log warn "$@"; }
log_error() { log error "$@"; }
