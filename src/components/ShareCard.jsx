import { useRef } from 'react'
import { GOLD, OBS, CREAM, MUTED } from '../lib/config'

export default function ShareCard({ idea, profile, onClose }) {
  const cardRef = useRef(null)

  const handleDownload = () => {
    const card = cardRef.current
    if (!card) return

    // Use html2canvas approach via canvas
    import('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js')
      .catch(() => {
        // Fallback: copy text to clipboard
        const text = `"${idea.title}"\n\nHook: ${idea.hook}\n\nMade with Calm AI — calm-ai-inky.vercel.app`
        navigator.clipboard.writeText(text)
        alert('Card text copied! Add it to your story manually.')
      })
  }

  const handleCopyText = () => {
    const text = `"${idea.title}"\n\n${idea.hook}\n\n#CalmAI #ContentCreator`
    navigator.clipboard.writeText(text)
    onClose()
  }

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 400, padding: '1rem', flexDirection: 'column', gap: 20 }}>

      {/* The shareable card */}
      <div ref={cardRef} style={{
        width: 380, background: '#0A0A0A',
        border: `1px solid ${GOLD}44`, borderRadius: 16,
        padding: '2rem', fontFamily: "'Inter', sans-serif",
        position: 'relative', overflow: 'hidden'
      }}>
        {/* Gold corner accent */}
        <div style={{ position: 'absolute', top: 0, right: 0, width: 60, height: 60, background: `linear-gradient(225deg, ${GOLD}33 0%, transparent 60%)` }} />

        {/* Logo */}
        <div style={{ fontFamily: "'Georgia', serif", fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', color: GOLD, marginBottom: '1.5rem' }}>✦ Calm AI</div>

        {/* Platform + niche */}
        <div style={{ display: 'flex', gap: 8, marginBottom: '1rem' }}>
          <div style={{ fontSize: 8, color: '#444', border: '1px solid #1C1C1C', padding: '2px 8px', borderRadius: 10, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{idea.platform}</div>
          {idea.emotion && <div style={{ fontSize: 8, color: '#444', border: '1px solid #1C1C1C', padding: '2px 8px', borderRadius: 10, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{idea.emotion}</div>}
        </div>

        {/* Main idea title */}
        <div style={{ fontSize: 18, fontWeight: 500, color: '#F0EBE0', lineHeight: 1.4, marginBottom: '1rem' }}>
          {idea.title}
        </div>

        {/* Hook */}
        <div style={{ fontSize: 11, color: '#555', lineHeight: 1.7, fontStyle: 'italic', borderLeft: `2px solid ${GOLD}44`, paddingLeft: 12, marginBottom: '1.5rem' }}>
          "{idea.hook}"
        </div>

        {/* Viral score if available */}
        {idea.viralScore && (
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: 8, letterSpacing: '0.15em', textTransform: 'uppercase', color: MUTED, marginBottom: 5 }}>Viral score</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ flex: 1, height: 3, background: '#1C1C1C', borderRadius: 2 }}>
                <div style={{ width: `${idea.viralScore}%`, height: '100%', background: GOLD, borderRadius: 2 }} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, color: GOLD }}>{idea.viralScore}</span>
            </div>
          </div>
        )}

        {/* Divider */}
        <div style={{ height: 1, background: '#1C1C1C', marginBottom: '1rem' }} />

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 9, color: '#333' }}>@{profile?.handle || 'creator'}</div>
          <div style={{ fontSize: 9, color: '#2A2A2A', letterSpacing: '0.1em' }}>calm-ai-inky.vercel.app</div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={handleCopyText} style={{
          background: GOLD, color: OBS, border: 'none', padding: '11px 24px',
          fontSize: 9, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase',
          borderRadius: 2, cursor: 'pointer', fontFamily: "'Inter', sans-serif"
        }}>Copy text for story</button>
        <button onClick={onClose} style={{
          background: 'transparent', border: '1px solid #2A2A2A', color: MUTED,
          padding: '11px 20px', fontSize: 9, borderRadius: 2, cursor: 'pointer',
          fontFamily: "'Inter', sans-serif"
        }}>Close</button>
      </div>

      <div style={{ fontSize: 9, color: '#333', textAlign: 'center' }}>
        Screenshot this card and share it to your stories · Tag @calmcreatives
      </div>
    </div>
  )
}
