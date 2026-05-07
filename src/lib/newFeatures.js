const API = '/api/claude'
const SYS = `You are a world-class content strategist. Always respond with valid JSON only. No markdown, no preamble.`

async function call(prompt, plan, userId, model) {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Plan-Id': plan || 'growth', 'X-User-Id': userId || 'anon' },
    body: JSON.stringify({ model: model || 'claude-haiku-4-5-20251001', max_tokens: 1200, system: SYS, messages: [{ role: 'user', content: prompt }] })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Failed')
  const text = data.content?.[0]?.text || '{}'
  try { return JSON.parse(text.replace(/```json|```/g, '').trim()) }
  catch { return null }
}

export async function generateThumbnailConcept(idea, profile, plan, userId) {
  const prompt = `Generate the perfect thumbnail concept for this content idea.

IDEA: "${idea.title}"
CREATOR: @${profile?.handle} | Niche: ${profile?.niches?.[0]} | Platform: ${idea.platform || 'YouTube'}
REGION: ${profile?.region === 'india' ? 'India — consider Indian aesthetic preferences' : 'Global'}

Return ONLY this JSON:
{
  "layout": "describe the visual layout of the thumbnail",
  "mainText": "the bold text overlay (max 5 words)",
  "subText": "secondary text if any",
  "emotion": "the face expression or emotional element",
  "colors": ["primary color", "accent color", "background color"],
  "style": "cinematic / bold graphic / talking head / text-only / collage",
  "canvaPrompt": "exact prompt to use in Canva to recreate this thumbnail",
  "doNot": "what to avoid in this thumbnail"
}`
  return call(prompt, plan, userId)
}

export async function generateBioVariants(currentBio, platform, profile, plan, userId) {
  const prompt = `Rewrite this ${platform} bio to be much more effective. Create 3 variants.

CURRENT BIO: "${currentBio || 'no bio provided'}"
CREATOR: @${profile?.handle} | Niche: ${profile?.niches?.join(', ')} | Goal: ${profile?.goal}
REGION: ${profile?.region === 'india' ? 'India' : 'Global'}

Return ONLY this JSON:
{
  "analysis": "what is wrong with the current bio in one sentence",
  "variants": [
    { "label": "Growth-focused", "bio": "rewritten bio", "why": "why this works" },
    { "label": "Brand-deal-ready", "bio": "rewritten bio", "why": "why this works" },
    { "label": "Community-first", "bio": "rewritten bio", "why": "why this works" }
  ],
  "keywordsToAdd": ["keyword 1", "keyword 2", "keyword 3"]
}`
  return call(prompt, plan, userId)
}

export async function generateContentSeries(topic, profile, plan, userId) {
  const regionNote = profile?.region === 'india'
    ? 'Make this series resonate with Indian audiences. Use Indian context and examples.'
    : 'Make this series globally relatable.'

  const prompt = `Plan a 5-part content series on this topic.

TOPIC: "${topic}"
CREATOR: @${profile?.handle} | Niche: ${profile?.niches?.join(', ')} | Platform: ${profile?.platforms?.[0]}
TONE: ${profile?.tone}
${regionNote}

Each video must build on the last. The series must have a narrative arc that rewards viewers who watch all 5.

Return ONLY this JSON:
{
  "seriesTitle": "overarching series name",
  "concept": "one sentence explaining the series arc",
  "videos": [
    {
      "number": 1,
      "title": "video title",
      "hook": "opening line",
      "mainPoint": "core message of this video",
      "cliffhanger": "why they will watch video 2"
    }
  ],
  "bestDay": "best day to start posting this series",
  "expectedOutcome": "what growth metric this series targets"
}`
  return call(prompt, plan, userId, plan === 'starter' ? 'claude-haiku-4-5-20251001' : 'claude-sonnet-4-20250514')
}

export async function getBestPostingTimes(profile, plan, userId) {
  const prompt = `Based on this creator's niche, platforms, and region, give specific best posting times.

CREATOR: Niche: ${profile?.niches?.join(', ')} | Platform: ${profile?.platforms?.join(', ')} | Region: ${profile?.region === 'india' ? 'India (IST)' : 'Global (UTC)'}
AUDIENCE: ${profile?.audience || 'general'}

Return ONLY this JSON:
{
  "summary": "one sentence about their optimal posting strategy",
  "schedule": [
    {
      "platform": "platform name",
      "bestDays": ["Monday", "Wednesday"],
      "bestTimes": ["7:00 PM IST", "8:00 AM IST"],
      "worstTimes": ["2:00 PM IST"],
      "frequency": "how many times per week",
      "reasoning": "why these times work for this niche and audience"
    }
  ],
  "proTip": "one advanced tip specific to this creator's region and niche"
}`
  return call(prompt, plan, userId)
}
