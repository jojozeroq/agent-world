#!/usr/bin/env bash
# Metrics dashboard

source lib/metrics.sh

echo "Agent World Metrics Dashboard"
echo "=============================="
echo ""

# Automation metrics
echo "Automation:"
echo "  Tasks extracted (1h): $(get_metric tasks_extracted 3600)"
echo "  Knowledge recorded (1h): $(get_metric knowledge_recorded 3600)"
echo ""

# System metrics
echo "System:"
echo "  API calls (1h): $(get_metric api_call 3600)"
echo "  Errors (1h): $(get_metric error 3600)"
echo ""

# Log file size
if [ -f .logs/aw.log ]; then
  echo "Logs:"
  echo "  Size: $(du -h .logs/aw.log | cut -f1)"
  echo "  Lines: $(wc -l < .logs/aw.log)"
fi
