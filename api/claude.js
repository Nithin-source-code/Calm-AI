import { createClient } from '@supabase/supabase-js'

const PLAN_LIMITS = {
  starter: { ideas: 10, scripts: 3, chat: 0, captions: 5 },
  growth:  { ideas: 40, scripts: 10, chat: 30, captions: 30 },
  pro:     { ideas: -1, scripts: -1, chat: -1, captions: -1 }
}

const memoryLimits = new Map()

async function checkRateLimit(userId) {
  const now = Date.now()
  const window = 60000
  const max = 30
  if (!memoryLimits.has(userId)) memoryLimits.set(userId, [])
  const recent = memoryLimits.get(userId).filter(t => now - t < window)
  if (recent.length >= max) return false
  recent.push(now)
  memoryLimits.set(userId, recent)
  return true
}

async function checkAndIncrementUsage(supabase, userId, usageType, plan) {
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.starter
  const limit = limits[usageType]
  if (limit === -1) return true
  const month = new Date().toISOString().slice(0, 7)
  const { data: existing } = await supabase.from('usage').select('*').eq('user_id', userId).eq('month', month).single()
  const current = existing?.[usageType] || 0
  if (current >= limit) return false
  if (existing) {
    await supabase.from('usage').update({ [usageType]: current + 1 }).eq('id', existing.id)
  } else {
    await supabase.from('usage').insert({ user_id: userId, month, [usageType]: 1 })
  }
  return true
}

// Convert Anthropic message format to Gemini format
function toGeminiMessages(messages, system) {
  const contents = []
  if (system) {
    contents.push({ role: 'user', parts: [{ text: `System instructions: ${system}` }] })
    contents.push({ role: 'model', parts: [{ text: 'Understood. I will follow these instructions.' }] })
  }
  for (const m of messages) {
    contents.push({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    })
  }
  return contents
}

// Call Gemini API and return response in Anthropic format
async function callGemini(geminiKey, messages, system, maxTokens) {
  // Use gemini-1.5-flash — fast and free tier
  const model = 'gemini-1.5-flash'
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`

  const contents = toGeminiMessages(messages, system)

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      generationConfig: {
        maxOutputTokens: Math.min(maxTokens || 1000, 3000),
        temperature: 0.7
      }
    })
  })

  const data = await response.json()
  if (!response.ok) throw new Error(data.error?.message || 'Gemini API error')

  // Convert Gemini response to Anthropic format so frontend code works unchanged
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
  return {
    content: [{ type: 'text', text }],
    model,
    role: 'assistant'
  }
}

// Call Anthropic Claude API
async function callClaude(anthropicKey, model, messages, system, maxTokens) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': anthropicKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({ model, max_tokens: maxTokens, messages, system })
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error?.message || 'Anthropic API error')
  return data
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Plan-Id, X-User-Id, X-Usage-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const anthropicKey = process.env.ANTHROPIC_API_KEY
  const geminiKey = process.env.GEMINI_API_KEY

  // Need at least one AI key
  if (!anthropicKey && !geminiKey) {
    return res.status(500).json({ error: 'No AI API key configured' })
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
  const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

  const planId = req.headers['x-plan-id'] || 'starter'
  const userId = req.headers['x-user-id'] || 'anonymous'
  const usageType = req.headers['x-usage-type'] || 'ideas'

  // Rate limit
  const allowed = await checkRateLimit(userId)
  if (!allowed) return res.status(429).json({ error: 'Too many requests. Please slow down.' })

  // Usage enforcement
  if (supabase && userId !== 'anonymous') {
    const withinLimit = await checkAndIncrementUsage(supabase, userId, usageType, planId)
    if (!withinLimit) {
      return res.status(403).json({ error: 'Monthly limit reached. Upgrade your plan to continue.' })
    }
  }

  const { model, max_tokens, messages, system } = req.body
  const safeTokens = Math.min(max_tokens || 1000, 3000)

  try {
    let data

    if (anthropicKey) {
      // Use Claude (primary — best quality)
      data = await callClaude(anthropicKey, model, messages, system, safeTokens)
    } else {
      // Fallback to Gemini (free tier)
      data = await callGemini(geminiKey, messages, system, safeTokens)
    }

    return res.status(200).json(data)

  } catch (err) {
    // If Claude fails (e.g. out of credits), try Gemini as fallback
    if (anthropicKey && geminiKey) {
      try {
        const fallback = await callGemini(geminiKey, messages, system, safeTokens)
        return res.status(200).json(fallback)
      } catch (fallbackErr) {
        return res.status(500).json({ error: 'Both AI APIs failed. Please try again.' })
      }
    }
    return res.status(500).json({ error: err.message || 'Something went wrong. Please try again.' })
  }
}
