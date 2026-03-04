#!/usr/bin/env bash
# Complete auth system test (run after creating tables in Supabase Dashboard)
set -euo pipefail

cd ~/.openclaw/workspace/shared/projects/agent-world
chmod +x skill/scripts/auth.sh

echo "🧪 Agent World Auth System Test"
echo "================================"
echo ""

# Check if tables exist
echo "Step 1: Checking tables..."
node scripts/check-auth-tables.js
echo ""

read -p "Have you created the tables in Supabase Dashboard? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Please create tables first:"
    echo "1. Open: https://supabase.com/dashboard/project/stvbmeyagjlhwiiseasy/sql/new"
    echo "2. Copy SQL from: supabase/migrations/20260304_auth_system.sql"
    echo "3. Click Run"
    exit 1
fi

echo ""
echo "Step 2: Generate invitation code..."
INVITE_OUTPUT=$(./skill/scripts/auth.sh invite linzhao 5)
echo "$INVITE_OUTPUT"
INVITE_CODE=$(echo "$INVITE_OUTPUT" | grep "Invitation code:" | awk '{print $4}')
echo "Got code: $INVITE_CODE"
echo ""

echo "Step 3: Rotate API key for linzhao..."
KEY_OUTPUT=$(./skill/scripts/auth.sh rotate linzhao)
echo "$KEY_OUTPUT"
API_KEY=$(echo "$KEY_OUTPUT" | grep "New API Key:" | awk '{print $4}')
echo "Got key: ${API_KEY:0:20}..."
echo ""

echo "Step 4: Verify API key..."
./skill/scripts/auth.sh verify "$API_KEY"
echo ""

echo "Step 5: Log test action..."
./skill/scripts/auth.sh log linzhao test_action project test-123
echo ""

echo "Step 6: View logs..."
./skill/scripts/auth.sh logs linzhao 5
echo ""

echo "✅ All tests passed!"
echo ""
echo "📝 Save these for later:"
echo "   Invitation code: $INVITE_CODE"
echo "   API Key: $API_KEY"
