#!/usr/bin/env bash
# Complete P0+P1 test suite
set -e

cd ~/.openclaw/workspace/shared/projects/agent-world
echo "🧪 Agent World Auth System - Full Test Suite"
echo "=============================================="
echo ""

# P0 Tests
echo "📦 P0: Core Authentication"
echo "---"

echo "1. Invite code generation..."
./skill/scripts/auth.sh invite linzhao 2 | grep "Invitation code"

echo "2. API key rotation..."
./skill/scripts/auth.sh rotate linzhao | grep "Key rotated"

echo "3. Operation logging..."
./skill/scripts/auth.sh log linzhao test_p0 test test-001
./skill/scripts/auth.sh logs linzhao 1 | grep "test_p0"

echo "✅ P0 tests passed"
echo ""

# P1 Tests
echo "📦 P1: Permissions & Rate Limiting"
echo "---"

echo "4. Role management..."
./skill/scripts/auth.sh role testbot member
./skill/scripts/auth.sh getrole testbot | grep "member"

echo "5. Rate limiting..."
for i in {1..10}; do ./skill/scripts/auth.sh ratelimit testbot >/dev/null; done
if ! ./skill/scripts/auth.sh ratelimit testbot 2>&1 | grep -q "exceeded"; then
  echo "❌ Rate limit not working"
  exit 1
fi

echo "✅ P1 tests passed"
echo ""
echo "🎉 All tests passed!"
