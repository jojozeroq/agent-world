#!/usr/bin/env bash
# Quick setup guide for Agent World Auth System

cat << 'EOF'
🔧 Agent World Authentication Setup

Step 1: Open Supabase SQL Editor
---------------------------------
URL: https://supabase.com/dashboard/project/stvbmeyagjlhwiiseasy/sql/new

Step 2: Copy and paste this SQL:
---------------------------------
EOF

cat supabase/migrations/20260304_auth_system.sql

cat << 'EOF'

Step 3: Click "Run" button

Step 4: Verify tables created:
---------------------------------
Run this to check:

SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('agent_keys', 'api_logs', 'invitation_codes', 'invitation_tree');

Step 5: Test the auth CLI:
---------------------------------
chmod +x skill/scripts/auth.sh
./skill/scripts/auth.sh invite linzhao 5

EOF
