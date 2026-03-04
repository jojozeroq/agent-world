#!/usr/bin/env node
// Execute SQL migration via Supabase client
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function migrate() {
  const sql = fs.readFileSync('supabase/migrations/20260304_auth_system.sql', 'utf8');
  
  // Execute each statement
  const statements = sql.split(';').filter(s => s.trim() && !s.trim().startsWith('--'));
  
  for (const stmt of statements) {
    const { error } = await supabase.rpc('exec_sql', { query: stmt + ';' });
    if (error) console.error('Error:', error);
    else console.log('✓');
  }
}

migrate();
