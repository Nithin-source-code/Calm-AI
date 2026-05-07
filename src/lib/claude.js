const API = '/api/claude'

const getHeaders = (plan = 'starter', userId = 'anon') => ({
  'Content-Type': 'application/json',
  'X-Plan-Id': plan,
  'X-User-Id': userId
})

const buildCreatorDNA = (profile) => `
Creator: ${profile.name} (@${profile.handle || 'unknown'})
Region: ${profile.region === 'india' ? 'India — optimise for Indian audience, Indian trends, relatable Indian context' : 'Global audience'}
Niche: ${profile.niches?.join(', ')}
Platforms: ${profile.platforms?.join(', ')}
Tone: ${profile.tone}
Audience: ${profile.audience || 'general'}
Goal: ${profile.goal}
Posts per week: ${profile.frequency}
About: ${profile.about || 'not provided'}
`.trim()

const SYSTEM = `You are a senior content strategist with 10+ years making creators go viral across YouTube, Instagram, and all major platforms. You have helped hundreds of creators grow from zero to millions of followers.

You never give generic advice. Every idea is specific to this creator's voice, audience, region, and niche. You think about psychology, timing, scroll-stopping hooks, and human emotion.

Always respond with valid JSON only. No markdown, no preamble, no explanation outside the JSON.`

export async function generateIdeas(profile, plan, userId, count = 6) {
  const dna = buildCreatorDNA(profile)
  const hooksPerIdea = plan === 'starter' ? 3 : plan === 'growth' ? 8 : 10
  const withScore = plan !== 'starter'
  const regionNote = profile.region === 'india'
    ? 'Include India-specific angles, trending topics in India, relatable desi context, or festival/cultural moments where relevant.'
    : 'Think globally. Include universal angles that resonate across cultures.'

  const prompt = `Generate ${count} viral content ideas for this creator.

CREATOR DNA:
${dna}

REGION INSTRUCTIONS: ${regionNote}

Rules:
- Every idea must be unique to this creator — only they can make it authentically
- No generic niche content — every idea needs a specific angle, emotion, and twist
- Each hook must stop the scroll in 2 seconds
- Think: curiosity, relatability, shock, aspiration, FOMO, controversy

Return ONLY this JSON:
{
  "ideas": [
    {
      "title": "specific video/post title",
      "hook": "opening line that stops the scroll",
      "angle": "the unexpected angle (myth-bust/confession/data/experiment/controversy)",
      "emotion": "primary emotion (curiosity/relatability/shock/aspiration/FOMO)",
      "whyViral": "one sentence why this works for this specific creator",
      "platform": "best platform",
      "hooks": ["hook 1", "hook 2", ...up to ${hooksPerIdea}]${withScore ? ',\n      "viralScore": 85,\n      "scoreReasons": ["reason 1", "reason 2", "reason 3"]' : ''}
    }
  ]
}`

  const res = await fetch(API, {
    method: 'POST',
    headers: getHeaders(plan, userId),
    body: JSON.stringify({
      model: plan === 'starter' ? 'claude-haiku-4-5-20251001' : 'claude-sonnet-4-20250514',
      max_tokens: 2500,
      system: SYSTEM,
      messages: [{ role: 'user', content: prompt }]
    })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Generation failed')
  const text = data.content?.[0]?.text || ''
  try { return JSON.parse(text.replace(/```json|```/g, '').trim()) }
  catch { return { ideas: [] } }
}

export async function generateScript(idea, profile, plan, userId) {
  const dna = buildCreatorDNA(profile)
  const prompt = `Write a complete script for this content idea.

CREATOR DNA:
${dna}

CONTENT IDEA:
Title: ${idea.title}
Hook: ${idea.hook}
Platform: ${idea.platform}

Write a complete script matching the creator's exact tone. Make it sound like them, not a template.

Return ONLY this JSON:
{
  "hook": "opening 3 seconds word for word",
  "setup": "context and setup (5-15 seconds)",
  "mainContent": "the main value section",
  "cta": "call to action",
  "fullScript": "complete flowing script",
  "estimatedDuration": "30 seconds / 1 minute / 3 minutes",
  "tips": ["filming tip 1", "filming tip 2", "filming tip 3"]
}`

  const res = await fetch(API, {
    method: 'POST',
    headers: getHeaders(plan, userId),
    body: JSON.stringify({
      model: plan === 'starter' ? 'claude-haiku-4-5-20251001' : 'claude-sonnet-4-20250514',
      max_tokens: 1800,
      system: SYSTEM,
      messages: [{ role: 'user', content: prompt }]
    })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Script generation failed')
  const text = data.content?.[0]?.text || ''
  try { return JSON.parse(text.replace(/```json|```/g, '').trim()) }
  catch { return null }
}

export async function generateCaptions(idea, profile, plan, userId) {
  const dna = buildCreatorDNA(profile)
  const regionNote = profile.region === 'india'
    ? 'Include Indian slang, relatable desi expressions, and Hindi-English mix where it feels natural.'
    : 'Keep captions universally relatable and engaging.'

  const prompt = `Generate caption and title variations for this content idea.

CREATOR DNA:
${dna}

IDEA: ${idea.title}
PLATFORM: ${idea.platform}
REGION: ${regionNote}

Return ONLY this JSON:
{
  "instagramCaptions": ["caption 1 (with emojis, hooks, hashtags)", "caption 2", "caption 3"],
  "youtubeTitles": ["title 1", "title 2", "title 3"],
  "tweetHooks": ["tweet 1 (under 280 chars)", "tweet 2", "tweet 3"],
  "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5", "#tag6", "#tag7", "#tag8"]
}`

  const res = await fetch(API, {
    method: 'POST',
    headers: getHeaders(plan, userId),
    body: JSON.stringify({
      model: plan === 'starter' ? 'claude-haiku-4-5-20251001' : 'claude-sonnet-4-20250514',
      max_tokens: 1200,
      system: SYSTEM,
      messages: [{ role: 'user', content: prompt }]
    })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Caption generation failed')
  const text = data.content?.[0]?.text || ''
  try { return JSON.parse(text.replace(/```json|```/g, '').trim()) }
  catch { return null }
}

export async function generateTrends(profile, plan, userId) {
  const regionNote = profile.region === 'india'
    ? 'Focus on trends rising in India — include topics relevant to Indian creators, Indian pop culture, and Indian digital audience behaviour.'
    : 'Focus on global trends rising across major platforms.'

  const prompt = `What are the top 6 rising content trends in the ${profile.niches?.[0]} niche right now on ${profile.platforms?.[0]}?

${regionNote}

For each trend give a specific content angle for this creator: @${profile.handle}, tone: ${profile.tone}.

Return ONLY this JSON:
{
  "trends": [
    {
      "name": "trend name",
      "reason": "why it is rising right now",
      "angle": "specific content angle for this creator",
      "score": 85,
      "platform": "platform name",
      "window": "trending now / rising fast / early signal"
    }
  ]
}`

  const res = await fetch(API, {
    method: 'POST',
    headers: getHeaders(plan, userId),
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: SYSTEM,
      messages: [{ role: 'user', content: prompt }]
    })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Trends failed')
  const text = data.content?.[0]?.text || ''
  try { return JSON.parse(text.replace(/```json|```/g, '').trim()) }
  catch { return { trends: [] } }
}

export async function chatWithStrategist(messages, profile, plan, userId) {
  const dna = buildCreatorDNA(profile)
  const systemWithContext = `${SYSTEM}

You are the personal AI content strategist for this specific creator:
${dna}

You know their niche, audience, tone, region, and goals deeply. Give advice that is specific to them. Never give generic content advice. Be direct, tactical, and concrete.`

  const res = await fetch(API, {
    method: 'POST',
    headers: getHeaders(plan, userId),
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1200,
      system: systemWithContext,
      messages: messages.map(m => ({ role: m.role, content: m.content }))
    })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Chat failed')
  return data.content?.[0]?.text || 'Something went wrong. Please try again.'
}
