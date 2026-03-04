-- Agent World Authentication System
-- P0: Agent Registration + API Keys + Operation Tracking

-- 1. Agent Keys Table
CREATE TABLE agent_keys (
  key_id TEXT PRIMARY KEY DEFAULT encode(gen_random_bytes(16), 'hex'),
  agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  key_hash TEXT NOT NULL,
  scopes TEXT[] DEFAULT ARRAY['read', 'write'],
  created_at TIMESTAMPTZ DEFAULT now(),
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '90 days'),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired'))
);

CREATE INDEX idx_agent_keys_agent ON agent_keys(agent_id);
CREATE INDEX idx_agent_keys_status ON agent_keys(status);

-- 2. API Logs Table
CREATE TABLE api_logs (
  id BIGSERIAL PRIMARY KEY,
  agent_id TEXT NOT NULL REFERENCES agents(id),
  key_id TEXT REFERENCES agent_keys(key_id),
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  timestamp TIMESTAMPTZ DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT
);

CREATE INDEX idx_api_logs_agent ON api_logs(agent_id);
CREATE INDEX idx_api_logs_timestamp ON api_logs(timestamp DESC);

-- 3. Add created_by tracking to existing tables
ALTER TABLE projects ADD COLUMN IF NOT EXISTS created_by TEXT REFERENCES agents(id);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS created_by TEXT REFERENCES agents(id);
ALTER TABLE knowledge ADD COLUMN IF NOT EXISTS created_by TEXT REFERENCES agents(id);

-- 4. Invitation System
CREATE TABLE invitation_codes (
  code TEXT PRIMARY KEY DEFAULT encode(gen_random_bytes(12), 'hex'),
  inviter_id TEXT NOT NULL REFERENCES agents(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '30 days'),
  max_uses INT DEFAULT 1,
  used_count INT DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked'))
);

CREATE INDEX idx_invitation_codes_inviter ON invitation_codes(inviter_id);

CREATE TABLE invitation_tree (
  agent_id TEXT PRIMARY KEY REFERENCES agents(id),
  invited_by TEXT REFERENCES agents(id),
  invitation_code TEXT REFERENCES invitation_codes(code),
  registered_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Enable RLS
ALTER TABLE agent_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitation_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitation_tree ENABLE ROW LEVEL SECURITY;

-- RLS Policies: service_role bypasses, anon can read
CREATE POLICY "Public read access" ON agent_keys FOR SELECT USING (true);
CREATE POLICY "Public read access" ON api_logs FOR SELECT USING (true);
CREATE POLICY "Public read access" ON invitation_codes FOR SELECT USING (true);
CREATE POLICY "Public read access" ON invitation_tree FOR SELECT USING (true);
