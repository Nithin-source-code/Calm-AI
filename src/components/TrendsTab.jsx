import { useState } from 'react'
import { generateTrends } from '../lib/claude'
import { GOLD, OBS, CREAM, MUTED, BORDER, SURFACE } from '../lib/config'

export default function TrendsTab({ user, profile, plan, refreshUsage }) {
  const [trends, setTrends] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [lastFetched, setLastFetched] = useState(null)

  const handleFetch = async () => {
    setError('')
    setLoading(true)
    try {
      const result = await generateTrends(profile, plan, user?.id || 'anon')
      if (!result?.trends?.length) throw new Error('No trends found. Try again.')
      setTrends(result.trends)
      setLastFetched(new Date())
      refreshUsage()
    } catch (err) {
      setError(err.message || 'Failed to fetch trends.')
    }
    setLoading(false)
  }

  const windowColor = (w) => {
    if (w === 'trending now') return { bg: 'rgba(185,120,20,0.12)', color: '#C9A84C', border: 'rgba(185,120,20,0.3)' }
    if (w === 'rising fast') return { bg: 'rgba(50,120,200,0.1)', color: '#5A9FE0', border: 'rgba(50,120,200,0.25)' }
    return { bg: 'rgba(80,80,80,0.1)', color: '#666', border: '#2A2A2A' }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: 880, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 300, marginBottom: 6 }}>
            Trend <em style={{ color: GOLD }}>radar.</em>
          </div>
          <div style={{ fontSize: 10, color: MUTED }}>
            What's rising in your niche before it peaks ·
            {profile?.region === 'india' ? ' 🇮🇳 India' : ' 🌍 Global'}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          {lastFetched && <div style={{ fontSize: 9, color: '#333', marginBottom: 8 }}>Last updated {lastFetched.toLocaleTimeString()}</div>}
          <button onClick={handleFetch} disabled={loading} style={{
            background: GOLD, color: OBS, border: 'none', padding: '11px 24px',
            fontSize: 10, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase',
            borderRadius: 2, cursor: loading ? 'default' : 'pointer',
            fontFamily: "'Inter', sans-serif", opacity: loading ? 0.7 : 1
          }}>{loading ? 'Scanning...' : '⬆ Scan trends'}</button>
        </div>
      </div>

      {error && <div style={{ background: 'rgba(200,50,50,0.08)', border: '1px solid rgba(200,50,50,0.2)', borderRadius: 6, padding: '10px 14px', fontSize: 10, color: '#E05252', marginBottom: '1.5rem' }}>{error}</div>}

      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: '1.5rem', height: 130, opacity: 0.5 + (i * 0.08) }}>
              <div style={{ width: '45%', height: 8, background: '#1C1C1C', borderRadius: 4, marginBottom: 12 }} />
              <div style={{ width: '80%', height: 10, background: '#161616', borderRadius: 4, marginBottom: 8 }} />
              <div style={{ width: '65%', height: 8, background: '#161616', borderRadius: 4 }} />
            </div>
          ))}
        </div>
      )}

      {!loading && trends.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {trends.map((trend, i) => {
            const wc = windowColor(trend.window)
            return (
              <div key={i} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: '1.4rem', transition: 'border-color 0.2s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ fontSize: 8, background: wc.bg, color: wc.color, border: `1px solid ${wc.border}`, padding: '3px 9px', borderRadius: 12, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{trend.window}</div>
                  <div style={{ fontSize: 18, fontWeight: 600, color: trend.score > 75 ? GOLD : MUTED }}>{trend.score}</div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 500, color: CREAM, marginBottom: 8, lineHeight: 1.3 }}>{trend.name}</div>
                <div style={{ fontSize: 10, color: MUTED, marginBottom: 10, lineHeight: 1.6 }}>{trend.reason}</div>
                <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 10 }}>
                  <div style={{ fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#444', marginBottom: 5 }}>Your angle</div>
                  <div style={{ fontSize: 10, color: '#888', lineHeight: 1.6, fontStyle: 'italic' }}>"{trend.angle}"</div>
                </div>
                <div style={{ marginTop: 10, fontSize: 9, color: '#333' }}>{trend.platform}</div>
              </div>
            )
          })}
        </div>
      )}

      {!loading && trends.length === 0 && (
        <div style={{ textAlign: 'center', padding: '5rem 2rem', border: `1px dashed ${BORDER}`, borderRadius: 10 }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 300, color: MUTED, marginBottom: 10 }}>Radar is quiet.</div>
          <div style={{ fontSize: 10, color: '#333', marginBottom: '1.5rem' }}>Hit scan to see what's rising in {profile?.niches?.[0] || 'your niche'} right now.</div>
          <button onClick={handleFetch} style={{ background: GOLD, color: OBS, border: 'none', padding: '11px 24px', fontSize: 10, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', borderRadius: 2, cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>Scan now</button>
        </div>
      )}
    </div>
  )
}
