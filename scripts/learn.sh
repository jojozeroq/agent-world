#!/usr/bin/env bash
# Learning management tool

LEARNINGS_DIR=".learnings"
DATE=$(date +%Y-%m-%d)

case "${1:-help}" in

learn)
  title="${2:?usage: learn.sh learn <title>}"
  cat >> "$LEARNINGS_DIR/LEARNINGS.md" << EOF

### [$DATE] $title
**Context:** ${3:-}
**Learning:** ${4:-}
**Action:** ${5:-}
EOF
  echo "✅ Learning recorded"
  ;;

error)
  title="${2:?usage: learn.sh error <title>}"
  cat >> "$LEARNINGS_DIR/ERRORS.md" << EOF

### [$DATE] $title
**Context:** ${3:-}
**Error:** ${4:-}
**Fix:** ${5:-}
**Prevention:** ${6:-}
EOF
  echo "✅ Error recorded"
  ;;

*)
  echo "Usage: learn.sh {learn|error} <title> [details...]"
  ;;
esac
