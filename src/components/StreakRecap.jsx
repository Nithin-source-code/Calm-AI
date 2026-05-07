import { useState, useEffect } from 'react'
import { GOLD, OBS, CREAM, MUTED, BORDER, SURFACE } from '../lib/config'

// Streak tracker widget — shows in dashboard header area
export function StreakWidget({ usage, profile }) {
  const streak = profile?.streak_days || 0
  const totalIdeas = profile?.total_ideas_generated || (usage?.ideas || 0)

  const flames = Math.min(streak, 7)

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      background: streak > 0 ? `${GOLD}10` : 'transparent',
      border: `1px solid ${streak > 0 ? GOLD + '33' : '#1C1C1C'}`,
      borderRadius: 20, padding: '4px 12px'
    }}>
      <span style={{ fontSize: 12 }}>{streak > 0 ? '🔥' : '💤'}</span>
      <span style={{ fontSize: 9, color: streak > 0 ? GOLD : MUTED, fontWeight: streak > 0 ? 600 : 300, letterSpacing: '0.1em' }}>
        {streak > 0 ? `${streak} day streak` : 'Start your streak'}
      </span>
    </div>
  )
}

// Monthly recap modal — shows on first visit of new month
export function MonthlyRecap({ usage, profile, onClose }) {
  const month = new Date().toLocaleString('default', { month: 'long' })
  const prevMonth = new Date(new Date().setMonth(new Date().getMonth() - 1))
    .toLocaleString('default', { month: 'long' })

  const stats = [
    { label: 'Ideas generated', value: usage?.ideas || 0, icon: '✦', max: 40 },
    { label: 'Scripts written', value: usage?.scripts || 0, icon: '▶', max: 10 },
    { label: 'Captions created', value: usage?.captions || 0, icon: '✍', max: 30 },
    { label: 'Day streak', value: profile?.streak_days || 0, icon: '🔥', max: 30 },
  ]

  const totalActivity = stats.reduce((sum, s) => sum + s.value, 0)
  const topStat = stats.reduce((a, b) => a.value > b.value ? a : b)

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 400, padding: '1rem' }}>
      <div style={{ background: '#0F0F0F', border: `1px solid ${GOLD}44`, borderRadius: 16, padding: '2.5rem', width: '100%', maxWidth: 460, textAlign: 'center' }}>

        {/* Header */}
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', color: GOLD, marginBottom: 8 }}>Monthly recap</div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 300, marginBottom: 6 }}>
          {prevMonth} <em style={{ color: GOLD }}>in review.</em>
        </div>
        <div style={{ fontSize: 10, color: MUTED, marginBottom: '2rem' }}>
          @{profile?.handle || 'creator'} · {profile?.niches?.[0] || 'creator'}
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: '1.5rem' }}>
          {stats.map((s, i) => (
            <div key={i} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: '1rem' }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontSize: 28, fontWeight: 600, color: s.value > 0 ? GOLD : '#333', lineHeight: 1, marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 9, color: MUTED, letterSpacing: '0.1em' }}>{s.label}</div>
              {/* Mini progress bar */}
              <div style={{ height: 2, background: '#1C1C1C', borderRadius: 1, marginTop: 8 }}>
                <div style={{ width: `${Math.min((s.value / s.max) * 100, 100)}%`, height: '100%', background: GOLD, borderRadius: 1 }} />
              </div>
            </div>
          ))}
        </div>

        {/* Highlight message */}
        <div style={{ background: `${GOLD}10`, border: `1px solid ${GOLD}33`, borderRadius: 10, padding: '1rem', marginBottom: '1.5rem' }}>
          {totalActivity === 0 ? (
            <div style={{ fontSize: 12, color: MUTED }}>This month is just getting started. Generate your first idea today.</div>
          ) : (
            <div style={{ fontSize: 12, color: '#888', lineHeight: 1.7 }}>
              Your top activity was <span style={{ color: GOLD, fontWeight: 500 }}>{topStat.label.toLowerCase()}</span> with {topStat.value} this month.
              {profile?.streak_days > 3 && <span> You're on a {profile.streak_days}-day streak — keep it going.</span>}
            </div>
          )}
        </div>

        {/* Share text */}
        <div style={{ marginBottom: '1.5rem' }}>
          <button onClick={() => {
            const text = `${prevMonth} on Calm AI:\n✦ ${usage?.ideas || 0} ideas generated\n▶ ${usage?.scripts || 0} scripts written\n🔥 ${profile?.streak_days || 0} day streak\n\nMade with Calm AI — calm-ai-inky.vercel.app`
            navigator.clipboard.writeText(text)
          }} style={{ background: 'transparent', border: `1px solid #2A2A2A`, color: MUTED, padding: '8px 18px', fontSize: 9, borderRadius: 2, cursor: 'pointer', fontFamily: "'Inter', sans-serif", letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Copy recap to share
          </button>
        </div>

        <button onClick={onClose} style={{ background: GOLD, color: OBS, border: 'none', padding: '11px 28px', fontSize: 9, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', borderRadius: 2, cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>
          Start {month} strong →
        </button>
      </div>
    </div>
  )
}
