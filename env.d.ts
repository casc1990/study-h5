// Cloudflare Workers 环境变量类型定义
interface Env {
  // Database
  DB: D1Database

  // Storage
  ASSETS: R2Bucket

  // API Keys
  APIMART_TOKEN: string
  MINIMAX_TOKEN: string
  OPENAI_API_KEY?: string

  // Config
  AI_BASE_URL?: string
}

// D1 数据库表结构
interface Challenge {
  id: string
  name: string
  subject: string
  grade: string
  file_name: string
  transcript: string
  knowledge_points: string  // JSON string
  questions: string         // JSON string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  created_at: string
  updated_at?: string
}

interface ChallengeRecord {
  id: string
  challenge_id: string
  score: number
  correct_count: number
  total_count: number
  completed_at: string
}

interface UserStats {
  id: string
  total_days: number
  total_challenges: number
  total_questions: number
  total_correct: number
  continuous_days: number
  last_study_date: string
}

// 全局类型声明
declare const DB: D1Database
declare const ASSETS: R2Bucket