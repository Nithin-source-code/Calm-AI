import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { GOLD, OBS, CREAM, MUTED, BORDER, SURFACE } from '../lib/config'
import Logo from '../components/Logo'

const PLATFORMS = ['YouTube', 'Instagram', 'YouTube Shorts', 'X / Twitter', 'LinkedIn', 'Podcast']
const NICHES = ['Finance', 'Fitness', 'Food', 'Fashion', 'Travel', 'Education', 'Comedy', 'Beauty', 'Business', 'Lifestyle', 'Gaming', 'Technology', 'Music', 'Motivation', 'Health', 'Art', 'Other']
const GOALS = ['Grow my followers fast', 'Get my first brand deal', 'Go viral', 'Build a personal brand', 'Monetise my content', 'Post consistently', 'Reach 100K subscribers', 'Launch a product']
const SIZES = ['Just starting (0–1K)', 'Growing (1K–10K)', 'Established (10K–100K)', 'Large (100K+)']
const REGIONS = [{ id: 'india', flag: '🇮🇳', label: 'India' }, { id: 'global', flag: '🌍', label: 'Global' }]

export default function Onboarding({ user, onComplete }) {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState({ handle: '', channelUrl: '', platforms: [], niches: [], goal: '', audienceSize: '', region: 'india', about: '', tone: 'Casual and friendly' })

  const u = (k, v) => setData(d => ({ ...d, [k]: v }))
  const toggle = (k, v) => setData(d => { const a = d[k] || []; return { ...d, [k]: a.includes(v) ? a.filter(x => x !== v) : [...a, v] } })

  const chip = (active) => ({
    padding: '8px 16px', borderRadius: 20, fontSize: 10, cursor: 'pointer',
    border: `1px solid ${active ? GOLD : '#2A2A2A'}`,
    background: active ? `${GOLD}18` : 'transparent',
    color: active ? GOLD : MUTED, fontFamily: "'Inter', sans-serif",
    fontWeight: active ? 500 : 300, transition: 'all 0.2s ease'
  })

  const inp = { width: '100%', background: '#0D0D0D', border: `1px solid #1C1C1C`, borderRadius: 6, padding: '12px 16px', fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 300, color: CREAM, outline: 'none' }

  const canNext = () => {
    if (step === 0) return data.region
    if (step === 1) return data.handle.trim() && data.platforms.length > 0
    if (step === 2) return data.niches.length > 0 && data.goal
    if (step === 3) return data.audienceSize
    return true
  }

  const handleComplete = async () => {
    setLoading(true)
    try {
      const plan = user?.user_metadata?.plan || 'starter'
      const profileData = { ...data, plan }
      if (user) {
        await supabase.from('profiles').upsert({
          id: user.id, full_name: user.user_metadata?.full_name || data.handle,
          email: user.email, plan, handle: data.handle,
          niches: data.niches, platforms: data.platforms,
          goal: data.goal, region: data.region, about: data.about, tone: data.tone,
          created_at: new Date().toISOString()
        })
      }
      onComplete(profileData)
    } catch (err) { console.error(err); setLoading(false) }
  }

  const steps = [
    {
      n: '01', title: 'Where are you creating?',
      sub: 'This shapes every idea, script, and strategy we build for you.',
      content: (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {REGIONS.map(r => (
            <div key={r.id} onClick={() => u('region', r.id)} style={{ border: `1px solid ${data.region === r.id ? GOLD : '#2A2A2A'}`, borderRadius: 12, padding: '2rem 1.5rem', cursor: 'pointer', textAlign: 'center', background: data.region === r.id ? `${GOLD}10` : '#0D0D0D', transition: 'all 0.2s ease' }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>{r.flag}</div>
              <div style={{ fontSize: 12, fontWeight: 500, color: data.region === r.id ? GOLD : CREAM, marginBottom: 5 }}>{r.label}</div>
              <div style={{ fontSize: 10, color: MUTED }}>{r.id === 'india' ? 'Indian trends + desi context' : 'Global platforms + universal angles'}</div>
            </div>
          ))}
        </div>
      )
    },
    {
      n: '02', title: 'Tell us about your channel.',
      sub: 'The more specific you are, the better your analysis will be.',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: MUTED, marginBottom: 6, display: 'block' }}>Handle or channel name</label>
            <input style={inp} placeholder="@yourhandle or 'Calm Finance'" value={data.handle} onChange={e => u('handle', e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: MUTED, marginBottom: 6, display: 'block' }}>Channel URL (optional — helps with analysis)</label>
            <input style={inp} placeholder="https://youtube.com/@yourhandle" value={data.channelUrl} onChange={e => u('channelUrl', e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: MUTED, marginBottom: 10, display: 'block' }}>Platforms you create for</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {PLATFORMS.map(p => <button key={p} type="button" onClick={() => toggle('platforms', p)} style={chip(data.platforms.includes(p))}>{p}</button>)}
            </div>
          </div>
        </div>
      )
    },
    {
      n: '03', title: 'Your niche and goal.',
      sub: "Be specific — this determines your entire strategy.",
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: MUTED, marginBottom: 10, display: 'block' }}>Your niche (pick up to 3)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {NICHES.map(n => <button key={n} type="button" onClick={() => { if (data.niches.includes(n)) toggle('niches', n); else if (data.niches.length < 3) toggle('niches', n) }} style={chip(data.niches.includes(n))}>{n}</button>)}
            </div>
          </div>
          <div>
            <label style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: MUTED, marginBottom: 10, display: 'block' }}>Primary goal right now</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {GOALS.map(g => <button key={g} type="button" onClick={() => u('goal', g)} style={chip(data.goal === g)}>{g}</button>)}
            </div>
          </div>
        </div>
      )
    },
    {
      n: '04', title: 'Where are you right now?',
      sub: 'Your current size helps us calibrate your strategy accurately.',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {SIZES.map(s => (
            <div key={s} onClick={() => u('audienceSize', s)} style={{ border: `1px solid ${data.audienceSize === s ? GOLD : '#2A2A2A'}`, borderRadius: 10, padding: '1rem 1.4rem', cursor: 'pointer', background: data.audienceSize === s ? `${GOLD}10` : '#0D0D0D', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: data.audienceSize === s ? GOLD : '#2A2A2A', flexShrink: 0, transition: 'all 0.2s' }} />
              <div style={{ fontSize: 12, color: data.audienceSize === s ? GOLD : CREAM, fontWeight: data.audienceSize === s ? 500 : 300 }}>{s}</div>
            </div>
          ))}
          <div style={{ marginTop: 8 }}>
            <label style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: MUTED, marginBottom: 6, display: 'block' }}>About your content (optional but powerful)</label>
            <textarea style={{ ...inp, resize: 'vertical', minHeight: 72 }} placeholder="What makes your channel unique? What have you tried? What's working?" value={data.about} onChange={e => u('about', e.target.value)} />
          </div>
        </div>
      )
    }
  ]

  return (
    <div style={{ background: OBS, minHeight: '100vh', fontFamily: "'Inter', sans-serif", color: CREAM, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div style={{ width: '100%', maxWidth: 560 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
            <Logo size={44} />
          </div>
          <div style={{ fontSize: 10, color: MUTED, letterSpacing: '0.12em' }}>Creator analysis engine</div>
        </div>

        <div style={{ display: 'flex', gap: 4, marginBottom: '1.8rem' }}>
          {steps.map((_, i) => <div key={i} style={{ flex: 1, height: 2, background: i <= step ? GOLD : '#1C1C1C', borderRadius: 1, transition: 'background 0.4s ease' }} />)}
        </div>

        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '2rem' }}>
          <div style={{ fontSize: 9, letterSpacing: '0.3em', color: GOLD, marginBottom: 12, fontWeight: 600 }}>{steps[step].n} / {steps.length.toString().padStart(2, '0')}</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 300, marginBottom: 6, lineHeight: 1.2 }}>{steps[step].title}</h2>
          <p style={{ fontSize: 11, color: MUTED, marginBottom: '1.8rem', lineHeight: 1.7 }}>{steps[step].sub}</p>
          {steps[step].content}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.2rem' }}>
          <button onClick={() => setStep(s => s - 1)} disabled={step === 0} style={{ background: 'transparent', border: `1px solid #2A2A2A`, color: step === 0 ? '#2A2A2A' : MUTED, padding: '10px 22px', fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', borderRadius: 2, cursor: step === 0 ? 'default' : 'pointer', fontFamily: "'Inter', sans-serif" }}>Back</button>
          {step < steps.length - 1 ? (
            <button onClick={() => canNext() && setStep(s => s + 1)} style={{ background: canNext() ? GOLD : '#1C1C1C', color: canNext() ? OBS : '#333', border: 'none', padding: '10px 28px', fontSize: 10, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', borderRadius: 2, cursor: canNext() ? 'pointer' : 'default', fontFamily: "'Inter', sans-serif", transition: 'all 0.2s' }}>Continue →</button>
          ) : (
            <button onClick={handleComplete} disabled={!canNext() || loading} style={{ background: canNext() ? GOLD : '#1C1C1C', color: canNext() ? OBS : '#333', border: 'none', padding: '10px 28px', fontSize: 10, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', borderRadius: 2, cursor: canNext() ? 'pointer' : 'default', fontFamily: "'Inter', sans-serif" }}>
              {loading ? 'Setting up...' : 'Analyse my channel →'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
