-- 小学课后强化学习助手 - D1 数据库初始化脚本

-- 1. 闯关题目表
CREATE TABLE IF NOT EXISTS challenges (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  grade TEXT NOT NULL,
  file_name TEXT,
  transcript TEXT,
  knowledge_points TEXT,  -- JSON 数组
  questions TEXT,          -- JSON 数组
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME
);

-- 2. 学习记录表
CREATE TABLE IF NOT EXISTS challenge_records (
  id TEXT PRIMARY KEY,
  challenge_id TEXT NOT NULL,
  score INTEGER DEFAULT 0,
  correct_count INTEGER DEFAULT 0,
  total_count INTEGER DEFAULT 0,
  completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (challenge_id) REFERENCES challenges(id)
);

-- 3. 用户统计表
CREATE TABLE IF NOT EXISTS user_stats (
  id TEXT PRIMARY KEY DEFAULT 'default',
  total_days INTEGER DEFAULT 0,
  total_challenges INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 0,
  total_correct INTEGER DEFAULT 0,
  continuous_days INTEGER DEFAULT 0,
  last_study_date DATE,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. 创建索引
CREATE INDEX IF NOT EXISTS idx_challenges_status ON challenges(status);
CREATE INDEX IF NOT EXISTS idx_challenges_subject ON challenges(subject);
CREATE INDEX IF NOT EXISTS idx_records_challenge ON challenge_records(challenge_id);
CREATE INDEX IF NOT EXISTS idx_records_date ON challenge_records(completed_at);

-- 5. 初始数据
INSERT OR IGNORE INTO user_stats (id, total_days, total_challenges, total_questions, total_correct, continuous_days)
VALUES ('default', 0, 0, 0, 0, 0);