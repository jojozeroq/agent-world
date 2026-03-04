#!/usr/bin/env node
// Minimal auth system setup via Supabase REST API
const https = require('https');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

async function query(sql) {
  return new Promise((resolve, reject) => {
    const url = new URL('/rest/v1/rpc/exec', SUPABASE_URL);
    const data = JSON.stringify({ sql });
    
    const req = https.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Length': data.length
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 400) {
          reject(new Error(`${res.statusCode}: ${body}`));
        } else {
          resolve(body);
        }
      });
    });
    
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function setup() {
  console.log('Setting up auth tables...');
  
  // Create agent_keys table
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS agent_keys (
        key_id TEXT PRIMARY KEY DEFAULT encode(gen_random_bytes(16), 'hex'),
        agent_id TEXT NOT NULL,
        key_hash TEXT NOT NULL,
        scopes TEXT[] DEFAULT ARRAY['read', 'write'],
        created_at TIMESTAMPTZ DEFAULT now(),
        last_used_at TIMESTAMPTZ,
        expires_at TIMESTAMPTZ DEFAULT (now() + interval '90 days'),
        status TEXT DEFAULT 'active'
      )
    `);
    console.log('✓ agent_keys');
  } catch (e) {
    console.error('agent_keys:', e.message);
  }
  
  // Create api_logs table
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS api_logs (
        id BIGSERIAL PRIMARY KEY,
        agent_id TEXT NOT NULL,
        key_id TEXT,
        action TEXT NOT NULL,
        resource_type TEXT,
        resource_id TEXT,
        timestamp TIMESTAMPTZ DEFAULT now()
      )
    `);
    console.log('✓ api_logs');
  } catch (e) {
    console.error('api_logs:', e.message);
  }
  
  console.log('Done');
}

setup().catch(console.error);
