#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

async function runMigration(sqlFile) {
  const sql = fs.readFileSync(sqlFile, 'utf8');
  
  // Split by semicolons and filter empty statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s && !s.startsWith('--'));

  console.log(`Running ${statements.length} statements from ${path.basename(sqlFile)}...`);

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    if (!stmt) continue;

    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
        },
        body: JSON.stringify({ query: stmt + ';' })
      });

      if (!res.ok) {
        const err = await res.text();
        console.error(`Statement ${i + 1} failed:`, err);
        console.error('SQL:', stmt.substring(0, 200));
      } else {
        console.log(`✓ Statement ${i + 1}`);
      }
    } catch (e) {
      console.error(`Statement ${i + 1} error:`, e.message);
    }
  }
}

const migrationFile = process.argv[2] || 'supabase/migrations/20260304_auth_system.sql';
runMigration(migrationFile).catch(console.error);
