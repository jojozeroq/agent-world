#!/usr/bin/env node
// Execute SQL via Supabase REST API (direct table creation)
const https = require('https');
const fs = require('fs');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

function request(method, path, data) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, SUPABASE_URL);
    const body = data ? JSON.stringify(data) : null;
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'return=representation'
      }
    };
    
    if (body) options.headers['Content-Length'] = Buffer.byteLength(body);
    
    const req = https.request(url, options, (res) => {
      let responseBody = '';
      res.on('data', chunk => responseBody += chunk);
      res.on('end', () => {
        if (res.statusCode >= 400) {
          reject(new Error(`${res.statusCode}: ${responseBody}`));
        } else {
          resolve(responseBody);
        }
      });
    });
    
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function checkTable(tableName) {
  try {
    await request('GET', `/rest/v1/${tableName}?limit=0`);
    return true;
  } catch (e) {
    return false;
  }
}

async function main() {
  console.log('🔍 Checking existing tables...');
  
  const tables = ['agent_keys', 'api_logs', 'invitation_codes', 'invitation_tree'];
  const existing = [];
  
  for (const table of tables) {
    if (await checkTable(table)) {
      existing.push(table);
    }
  }
  
  if (existing.length > 0) {
    console.log(`✅ Found existing tables: ${existing.join(', ')}`);
  }
  
  const missing = tables.filter(t => !existing.includes(t));
  
  if (missing.length === 0) {
    console.log('✅ All auth tables exist!');
    return;
  }
  
  console.log(`❌ Missing tables: ${missing.join(', ')}`);
  console.log('');
  console.log('📋 Please create them manually in Supabase Dashboard:');
  console.log('   https://supabase.com/dashboard/project/stvbmeyagjlhwiiseasy/sql/new');
  console.log('');
  console.log('   Copy SQL from: supabase/migrations/20260304_auth_system.sql');
}

main().catch(console.error);
