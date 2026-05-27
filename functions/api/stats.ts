import { Env } from '../../env'

/**
 * 获取学习统计数据
 * GET /api/stats
 */
export async function onRequest(context: { request: Request; env: Env }) {
  const { env } = context

  try {
    const db = env.DB

    // 获取用户统计数据
    const stats = await db.prepare(`
      SELECT * FROM user_stats LIMIT 1
    `).first()

    // 获取本周学习数据
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    const weekRecords = await db.prepare(`
      SELECT DATE(completed_at) as date, COUNT(*) as count
      FROM challenge_records
      WHERE completed_at >= ?
      GROUP BY DATE(completed_at)
    `).bind(weekStart.toISOString().split('T')[0]).all()

    // 获取学科分布
    const subjectStats = await db.prepare(`
      SELECT c.subject, COUNT(*) as count
      FROM challenge_records r
      JOIN challenges c ON r.challenge_id = c.id
      GROUP BY c.subject
    `).all()

    // 获取最近学习记录
    const recentRecords = await db.prepare(`
      SELECT c.name, r.*, c.subject
      FROM challenge_records r
      JOIN challenges c ON r.challenge_id = c.id
      ORDER BY r.completed_at DESC
      LIMIT 10
    `).all()

    return new Response(JSON.stringify({
      success: true,
      data: {
        totalDays: stats?.total_days || 0,
        totalChallenges: stats?.total_challenges || 0,
        totalQuestions: stats?.total_questions || 0,
        accuracy: stats ? Math.round((stats.total_correct / stats.total_questions) * 100) : 0,
        continuousDays: stats?.continuous_days || 0,
        weekData: weekRecords.results || [],
        subjectData: subjectStats.results || [],
        recentRecords: recentRecords.results || []
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Get stats error:', error)
    return new Response(JSON.stringify({ error: 'Failed to get stats' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}