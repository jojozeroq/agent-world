#!/usr/bin/env bash
# Test auth system (assumes tables are created in Supabase Dashboard)
set -euo pipefail

cd ~/.openclaw/workspace/shared/projects/agent-world

echo "🧪 Testing Agent World Authentication System"
echo ""

# 1. Generate invitation code
echo "1️⃣ Generating invitation code..."
./skill/scripts/auth.sh invite linzhao 3
echo ""

# 2. List invitations
echo "2️⃣ Listing invitations..."
./skill/scripts/auth.sh invites linzhao
echo ""

# 3. Test key rotation
echo "3️⃣ Rotating linzhao's API key..."
./skill/scripts/auth.sh rotate linzhao
echo ""

# 4. Log an action
echo "4️⃣ Logging test action..."
./skill/scripts/auth.sh log linzhao test_action project test-proj-123
echo ""

# 5. View logs
echo "5️⃣ Viewing recent logs..."
./skill/scripts/auth.sh logs linzhao 5
echo ""

echo "✅ All tests completed"
