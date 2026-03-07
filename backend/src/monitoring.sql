-- OBSERVABILITY & MONITORING SCHEMA

-- 1. Token Usage Tracking
CREATE TABLE token_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  request_id TEXT NOT NULL,
  prompt_tokens INT NOT NULL,
  completion_tokens INT NOT NULL,
  total_tokens INT NOT NULL,
  model TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Response Metrics (Performance)
CREATE TABLE response_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  request_id TEXT NOT NULL,
  duration_ms INT NOT NULL,
  metric_type TEXT CHECK (metric_type IN ('text', 'stream', 'tool_execution')),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tool Execution Logs
CREATE TABLE tool_execution_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  request_id TEXT NOT NULL,
  tool_name TEXT NOT NULL,
  duration INT NOT NULL,
  success BOOLEAN NOT NULL,
  error_message TEXT,
  metadata JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Critical Errors (For Alerts)
CREATE TABLE critical_errors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  request_id TEXT,
  message TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  stack TEXT,
  metadata JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. RPC function for aggregation
CREATE OR REPLACE FUNCTION get_user_token_aggregation(u_id UUID)
RETURNS TABLE (
  total_prompt_tokens BIGINT,
  total_completion_tokens BIGINT,
  total_requests BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    SUM(prompt_tokens)::BIGINT, 
    SUM(completion_tokens)::BIGINT, 
    COUNT(*)::BIGINT
  FROM token_usage
  WHERE user_id = u_id;
END;
$$ LANGUAGE plpgsql;

-- Indexes for performance
CREATE INDEX idx_token_usage_user ON token_usage(user_id);
CREATE INDEX idx_response_metrics_type ON response_metrics(metric_type);
CREATE INDEX idx_critical_errors_severity ON critical_errors(severity);
