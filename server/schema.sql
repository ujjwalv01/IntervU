CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) UNIQUE NOT NULL,
  password_hash VARCHAR(200) NOT NULL,
  role VARCHAR(120),
  experience_level VARCHAR(40),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS interview_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  interview_type VARCHAR(40) NOT NULL,
  status VARCHAR(20) DEFAULT 'in_progress',
  vapi_call_id VARCHAR(100),
  transcript JSONB,
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS feedback_reports (
  id SERIAL PRIMARY KEY,
  session_id INTEGER REFERENCES interview_sessions(id) ON DELETE CASCADE,
  overall_score INTEGER,
  category_scores JSONB,
  strengths JSONB,
  improvements JSONB,
  question_breakdown JSONB,
  summary TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
