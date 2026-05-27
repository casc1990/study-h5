import { Env } from '../env'

/**
 * 获取闯关详情
 * GET /api/challenge/:id
 */
export async function onRequest(context: { request: Request; env: Env }) {
  const { request, env } = context
  const url = new URL(request.url)
  const id = url.pathname.split('/').pop()

  if (!id) {
    return new Response(JSON.stringify({ error: 'Missing challenge ID' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    const db = env.DB

    const challenge = await db.prepare(`
      SELECT * FROM challenges WHERE id = ?
    `).bind(id).first()

    if (!challenge) {
      return new Response(JSON.stringify({ error: 'Challenge not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({
      success: true,
      data: {
        ...challenge,
        knowledge_points: JSON.parse(challenge.knowledge_points || '[]'),
        questions: JSON.parse(challenge.questions || '[]')
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Get challenge error:', error)
    return new Response(JSON.stringify({ error: 'Failed to get challenge' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}