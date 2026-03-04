#!/usr/bin/env python3
import os
import requests
import json

url = os.environ['SUPABASE_URL']
key = os.environ['SUPABASE_SERVICE_KEY']

# Read migration SQL
with open('supabase/migrations/20260304_auth_system.sql') as f:
    sql = f.read()

# Split into statements
statements = [s.strip() for s in sql.split(';') if s.strip() and not s.strip().startswith('--')]

print(f"Executing {len(statements)} statements...")

for i, stmt in enumerate(statements, 1):
    # Try to execute via query endpoint
    resp = requests.post(
        f"{url}/rest/v1/rpc/query",
        headers={
            'apikey': key,
            'Authorization': f'Bearer {key}',
            'Content-Type': 'application/json'
        },
        json={'query': stmt + ';'}
    )
    
    if resp.status_code < 400:
        print(f"✓ {i}")
    else:
        print(f"✗ {i}: {resp.text[:100]}")

print("Done")
