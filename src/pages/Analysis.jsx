import { useState, useEffect } from 'react'
import { GOLD, OBS, CREAM, MUTED, BORDER, SURFACE } from '../lib/config'

async function generateAnalysis(profile) {
  const regionNote = profile.region === 'india'
    ? 'This is an Indian creator. Give India-specific insights, reference Indian platforms, Indian audience behaviour, and Indian brand deal ecosystem.'
    : 'This is a global creator. Give globally applicable insights.'

  const prompt = `You are a world-class content strategist and creator analyst with 10+ years of experience growing YouTube channels and Instagram accounts. Analyse this creator profile like a professional analyst and produce a comprehensive report.

CREATOR PROFILE:
- Handle: ${profile.handle}
- Channel URL: ${profile.channelUrl || 'not provided'}
- Platforms: ${profile.platforms?.join(', ')}
- Niche: ${profile.niches?.join(', ')}
- Goal: ${profile.goal}
- Audience size: ${profile.audienceSize}
- Region: ${profile.region === 'india' ? 'India' : 'Global'}
- About: ${profile.about || 'not provided'}

${regionNote}

Be specific, direct, and professional. No generic advice — everything must be specific to this creator.

Return ONLY this JSON:
{
  "overallScore": 72,
  "verdict": "one sentence honest assessment of where they stand",
  "channelStrengths": ["specific strength 1", "specific strength 2", "specific strength 3"],
  "criticalGaps": ["specific gap 1", "specific gap 2", "specific gap 3"],
  "growthRoadmap": {
    "days30": "specific action for next 30 days",
    "days60": "specific action for days 31-60",
    "days90": "specific action for days 61-90"
  },
  "top5Ideas": [
    {"title": "specific video idea 1", "hook": "opening line", "why": "why this will work for them"},
    {"title": "specific video idea 2", "hook": "opening line", "why": "why this will work for them"},
    {"title": "specific video idea 3", "hook": "opening line", "why": "why this will work for them"},
    {"title": "specific video idea 4", "hook": "opening line", "why": "why this will work for them"},
    {"title": "specific video idea 5", "hook": "opening line", "why": "why this will work for them"}
  ],
  "monetisationPotential": {
    "score": 65,
    "readyFor": "what brand deals or monetisation they can realistically get right now",
    "brandCategories": ["brand category 1", "brand category 2", "brand category 3"],
    "timeToFirstDeal": "realistic estimate"
  },
  "scorecard": {
    "contentQuality": 70,
    "consistency": 60,
    "nicheClarity": 80,
    "hookStrength": 65,
    "audienceEngagement": 55
  },
  "urgentAction": "the single most important thing they must do this week"
}`

  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Plan-Id': 'growth', 'X-User-Id': 'analysis' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }]
    })
  })
  const data = await res.json()
  const text = data.content?.[0]?.text || '{}'
  try { return JSON.parse(text.replace(/```json|```/g, '').trim()) }
  catch { return null }
}

const LOADING_STEPS = [
  'Reading your creator profile...',
  'Analysing your niche and competition...',
  'Identifying growth opportunities...',
  'Building your 90-day roadmap...',
  'Generating your top 5 ideas...',
  'Calculating monetisation potential...',
  'Finalising your report...'
]

export default function Analysis({ profile, onContinue }) {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingStep, setLoadingStep] = useState(0)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState('')

  useEffect(() => {
    let stepInterval
    stepInterval = setInterval(() => {
      setLoadingStep(s => Math.min(s + 1, LOADING_STEPS.length - 1))
    }, 800)

    generateAnalysis(profile).then(r => {
      clearInterval(stepInterval)
      if (r) { setReport(r); setLoading(false) }
      else { setError('Analysis failed. Please try again.'); setLoading(false) }
    }).catch(() => {
      clearInterval(stepInterval)
      setError('Something went wrong. Please try again.')
      setLoading(false)
    })

    return () => clearInterval(stepInterval)
  }, [])

  const copy = (text, key) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(''), 2000)
  }

  const ScoreBar = ({ score, color }) => (
    <div style={{ height: 4, background: '#1C1C1C', borderRadius: 2, overflow: 'hidden' }}>
      <div style={{ width: `${score}%`, height: '100%', background: color || GOLD, borderRadius: 2, transition: 'width 1s ease', animation: 'growBar 1s ease forwards' }} />
    </div>
  )

  if (loading) return (
    <div style={{ background: OBS, minHeight: '100vh', fontFamily: "'Inter', sans-serif", color: CREAM, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, color: GOLD, letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '3rem' }}>Calm AI</div>

        {/* Animated analyser */}
        <div style={{ width: 80, height: 80, borderRadius: '50%', border: `1px solid ${GOLD}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', position: 'relative' }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', border: `2px solid transparent`, borderTopColor: GOLD, borderRightColor: GOLD + '44', animation: 'spin 1s linear infinite', position: 'absolute' }} />
          <div style={{ fontSize: 24, color: GOLD }}>◈</div>
        </div>

        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 300, marginBottom: '1rem' }}>
          Analysing <em style={{ color: GOLD }}>@{profile.handle}</em>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'left', maxWidth: 300, margin: '0 auto' }}>
          {LOADING_STEPS.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', opacity: i <= loadingStep ? 1 : 0.2, transition: 'opacity 0.4s ease' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: i < loadingStep ? GOLD : i === loadingStep ? GOLD : '#2A2A2A', flexShrink: 0, transition: 'background 0.3s' }} />
              <div style={{ fontSize: 10, color: i <= loadingStep ? '#888' : '#2A2A2A' }}>{s}</div>
              {i === loadingStep && <div style={{ width: 12, height: 12, borderRadius: '50%', border: `1.5px solid transparent`, borderTopColor: GOLD, animation: 'spin 0.7s linear infinite', marginLeft: 'auto', flexShrink: 0 }} />}
            </div>
          ))}
        </div>
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  )

  if (error) return (
    <div style={{ background: OBS, minHeight: '100vh', fontFamily: "'Inter', sans-serif", color: CREAM, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ fontSize: 32, marginBottom: 16 }}>⚠</div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, marginBottom: 8 }}>{error}</div>
        <button onClick={() => { setLoading(true); setError(''); setLoadingStep(0) }} style={{ background: GOLD, color: OBS, border: 'none', padding: '11px 24px', fontSize: 10, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', borderRadius: 2, cursor: 'pointer', fontFamily: "'Inter', sans-serif", marginTop: 16 }}>Try again</button>
      </div>
    </div>
  )

  return (
    <div style={{ background: OBS, minHeight: '100vh', fontFamily: "'Inter', sans-serif", color: CREAM, overflowX: 'hidden' }}>
      <style>{`@keyframes growBar{from{width:0}to{width:var(--w,100%)}}`}</style>

      {/* Nav */}
      <div style={{ borderBottom: `1px solid ${BORDER}`, padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(10px)', zIndex: 40 }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, color: GOLD, letterSpacing: '0.25em', textTransform: 'uppercase' }}>Calm AI</div>
        <div style={{ fontSize: 10, color: MUTED }}>Creator analysis report · @{profile.handle}</div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', padding: '3rem 1rem', borderBottom: `1px solid ${BORDER}`, marginBottom: '2rem' }}>
          <div style={{ fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', color: GOLD, marginBottom: 16 }}>Creator analysis complete</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(36px,6vw,64px)', fontWeight: 300, lineHeight: 0.95, marginBottom: 20 }}>
            @{profile.handle}<br /><em style={{ color: GOLD }}>analysed.</em>
          </h1>
          <p style={{ fontSize: 12, color: MUTED, maxWidth: 500, margin: '0 auto', lineHeight: 1.8 }}>{report.verdict}</p>
        </div>

        {/* Overall score */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: '2rem' }}>
          <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: MUTED, marginBottom: 10 }}>Overall score</div>
            <div style={{ fontSize: 56, fontWeight: 600, color: GOLD, lineHeight: 1 }}>{report.overallScore}</div>
            <div style={{ fontSize: 10, color: MUTED, marginTop: 6 }}>out of 100</div>
          </div>
          <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '1.5rem' }}>
            <div style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: GOLD, marginBottom: 12 }}>Urgent action</div>
            <div style={{ fontSize: 12, color: '#888', lineHeight: 1.7 }}>{report.urgentAction}</div>
          </div>
        </div>

        {/* Scorecard */}
        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: GOLD, marginBottom: 16 }}>Performance scorecard</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {Object.entries(report.scorecard || {}).map(([k, v]) => (
              <div key={k}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 10, color: MUTED, textTransform: 'capitalize', letterSpacing: '0.05em' }}>{k.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                  <span style={{ fontSize: 10, fontWeight: 500, color: v >= 75 ? GOLD : v >= 50 ? '#888' : '#E05252' }}>{v}</span>
                </div>
                <ScoreBar score={v} color={v >= 75 ? GOLD : v >= 50 ? '#666' : '#E05252'} />
              </div>
            ))}
          </div>
        </div>

        {/* Strengths + Gaps */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: '1.5rem' }}>
          <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '1.5rem' }}>
            <div style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#5DBE8A', marginBottom: 14 }}>Strengths</div>
            {report.channelStrengths?.map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, fontSize: 11, color: '#777', marginBottom: 10, lineHeight: 1.5 }}>
                <span style={{ color: '#5DBE8A', flexShrink: 0, marginTop: 1 }}>✓</span>{s}
              </div>
            ))}
          </div>
          <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '1.5rem' }}>
            <div style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#E05252', marginBottom: 14 }}>Critical gaps</div>
            {report.criticalGaps?.map((g, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, fontSize: 11, color: '#777', marginBottom: 10, lineHeight: 1.5 }}>
                <span style={{ color: '#E05252', flexShrink: 0, marginTop: 1 }}>→</span>{g}
              </div>
            ))}
          </div>
        </div>

        {/* 90-day roadmap */}
        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: GOLD, marginBottom: 16 }}>90-day growth roadmap</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            {[['Days 1–30', report.growthRoadmap?.days30, '#C9A84C'], ['Days 31–60', report.growthRoadmap?.days60, '#888'], ['Days 61–90', report.growthRoadmap?.days90, '#555']].map(([label, text, color]) => (
              <div key={label} style={{ borderLeft: `2px solid ${color}`, paddingLeft: 14 }}>
                <div style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color, marginBottom: 8, fontWeight: 600 }}>{label}</div>
                <div style={{ fontSize: 11, color: '#777', lineHeight: 1.7 }}>{text}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top 5 ideas */}
        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: GOLD }}>Top 5 content ideas for you</div>
            <div style={{ fontSize: 9, color: '#333' }}>Click to copy</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {report.top5Ideas?.map((idea, i) => (
              <div key={i} onClick={() => copy(`${idea.title}\n\nHook: "${idea.hook}"`, `idea-${i}`)} style={{ background: '#0D0D0D', border: `1px solid ${copied === `idea-${i}` ? GOLD + '55' : BORDER}`, borderRadius: 8, padding: '12px 14px', cursor: 'pointer', transition: 'border-color 0.2s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: CREAM, marginBottom: 5 }}>{idea.title}</div>
                    <div style={{ fontSize: 10, color: MUTED, fontStyle: 'italic', marginBottom: 5 }}>"{idea.hook}"</div>
                    <div style={{ fontSize: 9, color: '#444' }}>{idea.why}</div>
                  </div>
                  <div style={{ fontSize: 9, color: copied === `idea-${i}` ? GOLD : '#333', flexShrink: 0 }}>{copied === `idea-${i}` ? '✓' : 'copy'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monetisation */}
        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: GOLD }}>Monetisation potential</div>
            <div style={{ fontSize: 22, fontWeight: 600, color: GOLD }}>{report.monetisationPotential?.score}<span style={{ fontSize: 10, color: MUTED, fontWeight: 300 }}>/100</span></div>
          </div>
          <div style={{ fontSize: 11, color: '#777', lineHeight: 1.7, marginBottom: 14 }}>{report.monetisationPotential?.readyFor}</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
            {report.monetisationPotential?.brandCategories?.map((b, i) => (
              <div key={i} style={{ fontSize: 9, color: GOLD, background: `${GOLD}12`, border: `1px solid ${GOLD}33`, padding: '4px 12px', borderRadius: 20 }}>{b}</div>
            ))}
          </div>
          <div style={{ fontSize: 10, color: MUTED }}>
            Time to first deal: <span style={{ color: '#888', fontWeight: 500 }}>{report.monetisationPotential?.timeToFirstDeal}</span>
          </div>
        </div>

        {/* CTA — go to paywall */}
        <div style={{ background: `linear-gradient(135deg, #141210 0%, #0F0D0B 100%)`, border: `1px solid ${GOLD}33`, borderRadius: 14, padding: '2.5rem', textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: GOLD, marginBottom: 12 }}>Ready to start?</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(24px,4vw,40px)', fontWeight: 300, marginBottom: 12, lineHeight: 1.1 }}>
            Your analysis is done.<br /><em style={{ color: GOLD }}>Let's fix the gaps.</em>
          </h2>
          <p style={{ fontSize: 11, color: MUTED, marginBottom: '2rem', maxWidth: 400, margin: '0 auto 2rem', lineHeight: 1.8 }}>
            Pick a plan and get unlimited ideas, scripts, captions, and trend data — all built specifically for @{profile.handle}.
          </p>
          <button onClick={onContinue} style={{ background: GOLD, color: OBS, border: 'none', padding: '14px 40px', fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', borderRadius: 2, cursor: 'pointer', fontFamily: "'Inter', sans-serif', transition: 'all 0.2s'" }}>
            Choose your plan →
          </button>
        </div>
      </div>
    </div>
  )
}
