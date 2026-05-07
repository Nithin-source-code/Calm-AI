import { useState } from 'react'
import { PLANS, GOLD, OBS, CREAM, MUTED, BORDER, SURFACE } from '../lib/config'

export function UpgradeModal({ currentPlan, onClose }) {
  const [selected, setSelected] = useState('growth')

  const plans = [
    {
      id: 'growth', name: 'Growth', priceINR: '₹699', priceUSD: '$19',
      features: ['40 ideas/month', '10 scripts/month', '30 captions/month', 'Viral score + reasoning', 'Trend radar', 'AI chat — 30 messages', '8 hooks per idea'],
    },
    {
      id: 'pro', name: 'Pro', priceINR: '₹1,499', priceUSD: '$39',
      features: ['Unlimited everything', 'Daily trend radar', 'Unlimited AI chat', '10 hooks per idea', 'All future features'],
    }
  ]

  const handleUpgrade = () => {
    // Razorpay integration point
    const key = import.meta.env.VITE_RAZORPAY_KEY_ID
    if (!key) {
      alert('Payment system coming soon. Email calm@calmcreatives.com to upgrade manually.')
      return
    }
    const plan = plans.find(p => p.id === selected)
    const amount = selected === 'growth' ? 69900 : 149900 // in paise
    const options = {
      key,
      amount,
      currency: 'INR',
      name: 'Calm AI',
      description: `${plan.name} plan`,
      handler: function(response) {
        // TODO: call your own endpoint to verify and update plan in DB
        alert('Payment successful! Your plan will be updated shortly.')
        onClose()
      },
      prefill: {},
      theme: { color: GOLD }
    }
    const rzp = new window.Razorpay(options)
    rzp.open()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ background: '#0F0F0F', border: `1px solid ${BORDER}`, borderRadius: 14, padding: '2.5rem', width: '100%', maxWidth: 560 }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 300, marginBottom: 6 }}>Upgrade your plan.</div>
        <div style={{ fontSize: 10, color: MUTED, marginBottom: '2rem' }}>Unlock more ideas, scripts, and features.</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: '1.5rem' }}>
          {plans.filter(p => p.id !== currentPlan).map(plan => (
            <div key={plan.id} onClick={() => setSelected(plan.id)} style={{
              background: SURFACE, border: `1px solid ${selected === plan.id ? GOLD + '55' : BORDER}`,
              borderRadius: 10, padding: '1.2rem', cursor: 'pointer',
              transform: selected === plan.id ? 'translateY(-2px)' : 'none', transition: 'all 0.15s'
            }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 300, marginBottom: 4 }}>{plan.name}</div>
              <div style={{ fontSize: 22, fontWeight: 600, color: GOLD, marginBottom: '1rem', lineHeight: 1 }}>{plan.priceINR}<span style={{ fontSize: 10, color: MUTED, fontWeight: 300 }}>/mo</span></div>
              {plan.features.map((f, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, fontSize: 10, color: '#777', marginBottom: 6 }}>
                  <span style={{ color: GOLD, fontSize: 9, flexShrink: 0, marginTop: 1 }}>✓</span>{f}
                </div>
              ))}
            </div>
          ))}
        </div>

        <button onClick={handleUpgrade} style={{
          width: '100%', background: GOLD, color: OBS, border: 'none', padding: '13px',
          fontSize: 10, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase',
          borderRadius: 2, cursor: 'pointer', fontFamily: "'Inter', sans-serif"
        }}>Upgrade to {plans.find(p => p.id === selected)?.name} →</button>

        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: MUTED, fontSize: 10, cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>Maybe later</button>
        </div>
      </div>
    </div>
  )
}

export function SettingsPanel({ user, profile, onSave, onClose }) {
  const [form, setForm] = useState({ ...profile })
  const [saving, setSaving] = useState(false)
  const { NICHES, PLATFORMS, TONES, GOALS, REGIONS } = require('../lib/config')

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const toggleArr = (key, val) => setForm(f => {
    const arr = f[key] || []
    return { ...f, [key]: arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val] }
  })

  const handleSave = async () => {
    setSaving(true)
    try { await onSave(form) } catch (e) { console.error(e) }
    setSaving(false)
    onClose()
  }

  const chipStyle = (active) => ({
    padding: '6px 14px', borderRadius: 20, fontSize: 10, cursor: 'pointer',
    border: `1px solid ${active ? GOLD : '#2A2A2A'}`,
    background: active ? `${GOLD}18` : 'transparent',
    color: active ? GOLD : MUTED, fontFamily: "'Inter', sans-serif", fontWeight: active ? 500 : 300
  })

  const label = { fontSize: 9, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: MUTED, marginBottom: 8, display: 'block' }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem', overflowY: 'auto' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ background: '#0F0F0F', border: `1px solid ${BORDER}`, borderRadius: 14, padding: '2.5rem', width: '100%', maxWidth: 580, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 300, marginBottom: '2rem' }}>Creator settings.</div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={label}>Handle</label>
          <input value={form.handle || ''} onChange={e => update('handle', e.target.value)} style={{ width: '100%', background: '#0D0D0D', border: `1px solid ${BORDER}`, borderRadius: 3, padding: '10px 14px', fontSize: 11, color: CREAM, fontFamily: "'Inter', sans-serif", fontWeight: 300, outline: 'none' }} />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={label}>Region</label>
          <div style={{ display: 'flex', gap: 10 }}>
            {[{id:'india',label:'🇮🇳 India'},{id:'global',label:'🌍 Global'}].map(r => (
              <button key={r.id} type="button" onClick={() => update('region', r.id)} style={chipStyle(form.region === r.id)}>{r.label}</button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={label}>Niches</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {['Finance','Fitness','Food','Fashion','Travel','Education','Comedy','Beauty','Business','Lifestyle','Gaming','Technology','Other'].map(n => (
              <button key={n} type="button" onClick={() => toggleArr('niches', n)} style={chipStyle((form.niches||[]).includes(n))}>{n}</button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={label}>Platforms</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {['youtube','instagram','shorts','x','podcast'].map(p => (
              <button key={p} type="button" onClick={() => toggleArr('platforms', p)} style={chipStyle((form.platforms||[]).includes(p))}>{p}</button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={label}>Tone</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {['Casual and friendly','Educational and informative','Bold and provocative','Funny and entertaining','Inspirational','Expert and authoritative'].map(t => (
              <button key={t} type="button" onClick={() => update('tone', t)} style={chipStyle(form.tone === t)}>{t}</button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={label}>About your content</label>
          <textarea value={form.about || ''} onChange={e => update('about', e.target.value)} style={{ width: '100%', background: '#0D0D0D', border: `1px solid ${BORDER}`, borderRadius: 3, padding: '10px 14px', fontSize: 11, color: CREAM, fontFamily: "'Inter', sans-serif", fontWeight: 300, outline: 'none', resize: 'vertical', minHeight: 72 }} />
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={handleSave} disabled={saving} style={{ flex: 1, background: GOLD, color: OBS, border: 'none', padding: '12px', fontSize: 10, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', borderRadius: 2, cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>
            {saving ? 'Saving...' : 'Save changes'}
          </button>
          <button onClick={onClose} style={{ background: 'transparent', border: `1px solid #2A2A2A`, color: MUTED, padding: '12px 20px', fontSize: 10, borderRadius: 2, cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>Cancel</button>
        </div>
      </div>
    </div>
  )
}
