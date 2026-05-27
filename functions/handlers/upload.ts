import { Env } from '../env'

/**
 * 上传学习资料并触发 AI 分析
 * POST /api/upload
 * Content-Type: multipart/form-data
 * 
 * 流程：
 * 1. 接收文件（视频/图片/PDF）
 * 2. 提取音频（视频）→ Whisper 转文字
 * 3. VLM 分析提取知识点
 * 4. 生成闯关题目
 * 5. 保存到 D1 数据库
 */
export async function onRequest(context: { request: Request; env: Env }) {
  const { request, env } = context

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const subject = formData.get('subject') as string || '其他'
    const grade = formData.get('grade') as string || '1'

    if (!file) {
      return new Response(JSON.stringify({ error: '请上传学习资料' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // 检查文件类型
    const allowedTypes = ['video/mp4', 'image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      return new Response(JSON.stringify({
        error: '不支持的文件格式，仅支持 mp4/jpeg/png/webp/pdf'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // 保存文件到 R2 或 D1
    const fileId = crypto.randomUUID()
    const fileExt = file.name.split('.').pop()
    const fileName = `${fileId}.${fileExt}`

    // TODO: 保存文件到 Cloudflare R2
    // const r2 = env.ASSETS
    // await r2.put(fileName, file)

    // 根据文件类型处理
    let transcript = ''
    let knowledgePoints: string[] = []
    let questions: any[] = []

    if (file.type.startsWith('video')) {
      // 视频：提取音频 → Whisper 转文字
      transcript = await extractAudioAndTranscribe(file, env)
    } else if (file.type.startsWith('image')) {
      // 图片：直接 VLM 分析
      const result = await analyzeImage(file, env)
      knowledgePoints = result.knowledgePoints
      questions = result.questions
    } else if (file.type === 'application/pdf') {
      // PDF：提取文本 → 知识点整理
      const result = await analyzePDF(file, env)
      knowledgePoints = result.knowledgePoints
      questions = result.questions
    }

    // 生成闯关题目（如果还没生成）
    if (questions.length === 0) {
      questions = await generateQuestions(transcript || '', subject, grade, env)
      knowledgePoints = extractKnowledgePoints(questions)
    }

    // 保存闯关到 D1
    const db = env.DB
    const challengeId = crypto.randomUUID()

    await db.prepare(`
      INSERT INTO challenges (id, name, subject, grade, file_name, transcript, knowledge_points, questions, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', datetime('now'))
    `).bind(
      challengeId,
      `闯关-${subject}-${grade}年级`,
      subject,
      grade,
      fileName,
      transcript,
      JSON.stringify(knowledgePoints),
      JSON.stringify(questions)
    ).run()

    return new Response(JSON.stringify({
      success: true,
      data: {
        id: challengeId,
        name: `闯关-${subject}-${grade}年级`,
        subject,
        grade,
        knowledgePoints,
        questionCount: questions.length
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Upload error:', error)
    return new Response(JSON.stringify({
      error: '处理失败，请重试'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// 提取音频并转录
async function extractAudioAndTranscribe(file: File, env: Env): Promise<string> {
  // TODO: 使用 FFmpeg 提取音频
  // 由于 Cloudflare Workers 限制，需要用外部服务或 R2 处理
  
  // 临时方案：直接调用 Whisper（需要先提取音频）
  // 实际方案：使用 Cloudflare Media Processing 或流式处理
  
  // 示例：假设音频已提取，直接调用 Whisper
  const apimartToken = env.APIMART_TOKEN
  
  const formData = new FormData()
  formData.append('file', file)
  formData.append('model', 'whisper-1')
  formData.append('language', 'zh')

  const response = await fetch('https://api.apimart.ai/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apimartToken}`
    },
    body: formData
  })

  if (!response.ok) {
    throw new Error('Whisper transcription failed')
  }

  const result = await response.json()
  return result.text || ''
}

// 分析图片提取知识点
async function analyzeImage(file: File, env: Env): Promise<{ knowledgePoints: string[], questions: any[] }> {
  const minimaxToken = env.MINIMAX_TOKEN

  // 将图片转为 base64
  const arrayBuffer = await file.arrayBuffer()
  const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))

  const response = await fetch('https://api.minimaxi.chat/v1/coding_plan/vlm', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${minimaxToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'MiniMax-VL-01',
      messages: [{
        role: 'user',
        content: [{
          type: 'image_url',
          image_url: {
            url: `data:${file.type};base64,${base64}`
          }
        }, {
          type: 'text',
          text: '分析这张学习图片，提取其中的知识点，并生成3道针对小学生的练习题（包含题目、选项、正确答案、解析）。以JSON格式返回。'
        }]
      }],
      stream: false
    })
  })

  if (!response.ok) {
    throw new Error('VLM analysis failed')
  }

  const result = await response.json()
  const content = result.choices?.[0]?.message?.content || '{}'

  try {
    // 解析 VLM 返回的 JSON
    const parsed = JSON.parse(content)
    return {
      knowledgePoints: parsed.knowledgePoints || [],
      questions: parsed.questions || []
    }
  } catch {
    return { knowledgePoints: [], questions: [] }
  }
}

// 分析 PDF
async function analyzePDF(file: File, env: Env): Promise<{ knowledgePoints: string[], questions: any[] }> {
  // TODO: 实现 PDF 文本提取
  // Cloudflare Workers 可以使用 pdf.js 或类似库
  
  return { knowledgePoints: [], questions: [] }
}

// 根据文本生成闯关题目
async function generateQuestions(text: string, subject: string, grade: string, env: Env): Promise<any[]> {
  const openaiToken = env.OPENAI_API_KEY || env.APIMART_TOKEN
  const model = 'gpt-4o-mini'

  const response = await fetch('https://api.apimart.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages: [{
        role: 'system',
        content: `你是一个小学${subject}老师。根据提供的学习内容，生成5-10道闯关练习题。
        
要求：
1. 题目要贴合小学生理解能力
2. 题型包括选择题和填空题
3. 每题10分
4. 返回JSON数组格式

题目格式：
{
  "type": "选择题|填空题",
  "question": "题目内容",
  "options": [{ "key": "A", "text": "选项内容" }],  // 选择题需要
  "answer": "正确答案",
  "explanation": "解析说明"
}`
      }, {
        role: 'user',
        content: `这是${grade}年级${subject}的学习内容：\n\n${text}\n\n请生成闯关练习题。`
      }],
      stream: false
    })
  })

  if (!response.ok) {
    throw new Error('Question generation failed')
  }

  const result = await response.json()
  const content = result.choices?.[0]?.message?.content || '[]'

  try {
    // 清理 markdown 代码块
    const cleaned = content.replace(/```json\n?|```\n?/g, '').trim()
    return JSON.parse(cleaned)
  } catch {
    return []
  }
}

// 从题目中提取知识点
function extractKnowledgePoints(questions: any[]): string[] {
  // TODO: 实现知识点提取逻辑
  return questions.map(q => q.knowledgePoint).filter(Boolean)
}