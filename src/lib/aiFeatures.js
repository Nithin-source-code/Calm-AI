const API = '/api/claude'
const SYSTEM = `You are a senior content strategist who has studied thousands of viral posts. You analyse content with precision and give specific, actionable insights. Always respond with valid JSON only. No markdown, no preamble.`

export async function analyseViralPost(postText, profile, plan, userId) {
  const regionNote = profile?.region === 'india'
    ? 'Give examples and angles relevant to Indian creators and Indian audience behaviour.'
    : 'Give globally applicable insights.'

  const prompt = `Analyse why this content is viral and give a personalised version for this creator.

CONTENT TO ANALYSE:
"${postText}"

CREATOR: @${profile?.handle || 'creator'} | Niche: ${profile?.niches?.[0] || 'general'} | Tone: ${profile?.tone || 'casual'}
${regionNote}

Return ONLY this JSON:
{
  "viralScore": 87,
  "whyItWorks": ["reason 1", "reason 2", "reason 3"],
  "psychologyUsed": "curiosity gap / relatability / shock / aspiration / FOMO",
  "hookBreakdown": "what makes the opening work",
  "yourVersion": "a personalised version of this idea for this specific creator",
  "yourHook": "opening line for the personalised version",
  "improvements": ["what would make the original even stronger 1", "improvement 2"]
}`

  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Plan-Id': plan, 'X-User-Id': userId },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 800,
      system: SYSTEM,
      messages: [{ role: 'user', content: prompt }]
    })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Analysis failed')
  const text = data.content?.[0]?.text || '{}'
  try { return JSON.parse(text.replace(/```json|```/g, '').trim()) }
  catch { return null }
}

export async function scoreHook(hook, profile, plan, userId) {
  const prompt = `Score this content hook and give specific improvements.

HOOK: "${hook}"
CREATOR: @${profile?.handle || 'creator'} | Niche: ${profile?.niches?.[0] || 'general'} | Platform: ${profile?.platforms?.[0] || 'instagram'}
REGION: ${profile?.region === 'india' ? 'India — consider Indian audience behaviour' : 'Global'}

Return ONLY this JSON:
{
  "score": 72,
  "grade": "B+",
  "whatWorks": "what is strong about this hook",
  "whatToFix": "the single biggest weakness",
  "improvedVersions": [
    "improved hook version 1",
    "improved hook version 2",
    "improved hook version 3"
  ],
  "scoreBreakdown": {
    "curiosity": 80,
    "clarity": 70,
    "emotion": 65,
    "specificity": 75
  }
}`

  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Plan-Id': plan, 'X-User-Id': userId },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      system: SYSTEM,
      messages: [{ role: 'user', content: prompt }]
    })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Hook scoring failed')
  const text = data.content?.[0]?.text || '{}'
  try { return JSON.parse(text.replace(/```json|```/g, '').trim()) }
  catch { return null }
}

export async function repurposeToAllPlatforms(idea, profile, plan, userId) {
  const regionNote = profile?.region === 'india'
    ? 'Make all versions relevant for Indian audience. Include Hindi-English mix where it feels natural for Instagram.'
    : 'Keep all versions globally relatable.'

  const prompt = `Repurpose this content idea for all major platforms.

IDEA: "${idea.title}"
HOOK: "${idea.hook}"
CREATOR: @${profile?.handle || 'creator'} | Niche: ${profile?.niches?.[0] || 'general'} | Tone: ${profile?.tone || 'casual'}
${regionNote}

Return ONLY this JSON:
{
  "instagram": {
    "reelHook": "opening line for a Reel (under 5 seconds)",
    "caption": "full Instagram caption with emojis and hashtags",
    "storyAngle": "how to do this as a story series"
  },
  "youtube": {
    "title": "YouTube video title (under 60 chars)",
    "thumbnail": "describe the perfect thumbnail: layout, text, emotion",
    "hook": "opening 30 seconds script"
  },
  "twitter": {
    "tweet": "single tweet under 280 characters",
    "thread": ["tweet 1 to start a thread", "tweet 2", "tweet 3 with CTA"]
  },
  "linkedin": {
    "hook": "opening line for LinkedIn",
    "angle": "how to frame this for a professional audience"
  },
  "shorts": {
    "hook": "YouTube Shorts / Instagram Reels opening line",
    "structure": "3-step structure for a 30-second short"
  }
}`

  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Plan-Id': plan, 'X-User-Id': userId },
    body: JSON.stringify({
      model: plan === 'starter' ? 'claude-haiku-4-5-20251001' : 'claude-sonnet-4-20250514',
      max_tokens: 1200,
      system: SYSTEM,
      messages: [{ role: 'user', content: prompt }]
    })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Repurposing failed')
  const text = data.content?.[0]?.text || '{}'
  try { return JSON.parse(text.replace(/```json|```/g, '').trim()) }
  catch { return null }
}
