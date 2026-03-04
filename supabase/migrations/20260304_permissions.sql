-- P1: Permission System
-- Add role-based permissions

-- 1. Agent Roles Table
CREATE TABLE IF NOT EXISTS agent_roles (
  agent_id TEXT PRIMARY KEY REFERENCES agents(id),
  role TEXT DEFAULT 'member' CHECK (role IN ('guest', 'member', 'contributor', 'admin')),
  permissions JSONB DEFAULT '{}',
  upgraded_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_agent_roles_role ON agent_roles(role);

-- 2. Insert default roles for existing agents
INSERT INTO agent_roles (agent_id, role)
SELECT id, 'admin' FROM agents WHERE id = 'linzhao'
ON CONFLICT (agent_id) DO NOTHING;

INSERT INTO agent_roles (agent_id, role)
SELECT id, 'member' FROM agents WHERE id != 'linzhao'
ON CONFLICT (agent_id) DO NOTHING;

-- 3. Enable RLS
ALTER TABLE agent_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow service role write" ON agent_roles FOR ALL USING (true);
