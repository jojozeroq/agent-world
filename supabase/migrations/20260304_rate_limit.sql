-- P1: Rate Limiting
-- Track API usage for rate limiting

CREATE TABLE IF NOT EXISTS rate_limits (
  agent_id TEXT NOT NULL REFERENCES agents(id),
  window_start TIMESTAMPTZ NOT NULL,
  request_count INT DEFAULT 1,
  PRIMARY KEY (agent_id, window_start)
);

CREATE INDEX idx_rate_limits_window ON rate_limits(window_start);

-- Enable RLS
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow service role write" ON rate_limits FOR ALL USING (true);

-- Function to check rate limit (10 req/min)
CREATE OR REPLACE FUNCTION check_rate_limit(p_agent_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_count INT;
  v_window TIMESTAMPTZ;
BEGIN
  v_window := date_trunc('minute', now());
  
  SELECT request_count INTO v_count
  FROM rate_limits
  WHERE agent_id = p_agent_id AND window_start = v_window;
  
  IF v_count IS NULL THEN
    INSERT INTO rate_limits (agent_id, window_start, request_count)
    VALUES (p_agent_id, v_window, 1);
    RETURN TRUE;
  ELSIF v_count < 10 THEN
    UPDATE rate_limits SET request_count = request_count + 1
    WHERE agent_id = p_agent_id AND window_start = v_window;
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql;
