import { useState } from 'react'
import { generateScript } from '../lib/claude'
import { PLANS, GOLD, OBS, CREAM, MUTED, BORDER, SURFACE } from '../lib/config'

export default function ScriptsTab({ user, profile, plan, usage, savedIdeas, refreshUsage }) {
  const [selectedIdea, setSelectedIdea] = useState(null)
  const [customTopic, setCustomTopic] = useState('')
  const [script, setScript] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState('')
  const [mode, setMode] = useState('saved') // saved | custom

  const planConfig = PLANS[plan]
  const limit = planConfig?.limits?.scripts
  const remaining = limit === -1 ? '∞' : Math.max(0, limit - (usage.scripts || 0))
  const canGenerate = limit === -1 || (usage.scripts || 0) < limit

  const handleGenerate = async () => {
    setError('')
    setLoading(true)
    setScript(null)
    try {
      const idea = mode === 'saved' && selectedIdea
        ? selectedIdea
        : { title: customTopic, hook: customTopic, platform: profile?.platforms?.[0] || 'instagram' }
      if (!idea.title) throw new Error('Please select an idea or enter a topic.')
      const result = await generateScript(idea, profile, plan, user?.id || 'anon')
      if (!result) throw new Error('Script generation failed. Try again.')
      setScript(result)
      refreshUsage()
    } catch (err) {
      setError(err.message || 'Generation failed.')
    }
    setLoading(false)
  }

  const copyText = (text, key) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key)
      setTimeout(() => setCopied(''), 2000)
    })
  }

  const copyAll = () => {
    if (!script) return
    const full = `HOOK:\n${script.hook}\n\nSETUP:\n${script.setup}\n\nMAIN CONTENT:\n${script.mainContent}\n\nCTA:\n${script.cta}`
    copyText(full, 'all')
  }

  const Btn = ({ children, onClick, active, small }) => (
    <button onClick={onClick} style={{
      background: active ? `${GOLD}18` : 'transparent',
      border: `1px solid ${active ? GOLD + '55' : '#2A2A2A'}`,
      color: active ? GOLD : MUTED,
      padding: small ? '5px 12px' : '8px 18px',
      fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase',
      borderRadius: 2, cursor: 'pointer', fontFamily: "'Inter', sans-serif",
      fontWeight: active ? 500 : 300
    }}>{children}</button>
  )

  const Section = ({ label, content, copyKey }) => (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: GOLD, fontWeight: 600 }}>{label}</div>
        <button onClick={() => copyText(content, copyKey)} style={{
          background: 'transparent', border: 'none', color: copied === copyKey ? GOLD : '#444',
          fontSize: 9, cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase',
          fontFamily: "'Inter', sans-serif"
        }}>{copied === copyKey ? '✓ copied' : 'copy'}</button>
      </div>
      <div style={{ background: '#0D0D0D', borderLeft: `2px solid ${BORDER}`, borderRadius: '0 4px 4px 0', padding: '12px 14px', fontSize: 11, color: '#888', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{content}</div>
    </div>
  )

  return (
    <div style={{ padding: '2rem', maxWidth: 880, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 300, marginBottom: 6 }}>
            Script <em style={{ color: GOLD }}>generator.</em>
          </div>
          <div style={{ fontSize: 10, color: MUTED }}>{remaining} scripts remaining this month</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: script ? '1fr 1.4fr' : '1fr', gap: 24 }}>
        {/* Left — input */}
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: '1.2rem' }}>
            <Btn active={mode === 'saved'} onClick={() => setMode('saved')}>From saved idea</Btn>
            <Btn active={mode === 'custom'} onClick={() => setMode('custom')}>Custom topic</Btn>
          </div>

          {mode === 'saved' && (
            <div style={{ marginBottom: '1.2rem' }}>
              {savedIdeas.length === 0 ? (
                <div style={{ padding: '1.5rem', background: SURFACE, border: `1px dashed ${BORDER}`, borderRadius: 8, fontSize: 10, color: MUTED, textAlign: 'center' }}>
                  No saved ideas yet. Generate and save ideas from the Ideas tab first.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {savedIdeas.map((idea, i) => (
                    <div key={i} onClick={() => setSelectedIdea(idea)} style={{
                      background: SURFACE, border: `1px solid ${selectedIdea?.title === idea.title ? GOLD + '66' : BORDER}`,
                      borderRadius: 8, padding: '12px 14px', cursor: 'pointer', transition: 'border-color 0.15s'
                    }}>
                      <div style={{ fontSize: 10, color: '#444', marginBottom: 4, letterSpacing: '0.1em' }}>{idea.platform?.toUpperCase()}</div>
                      <div style={{ fontSize: 12, fontWeight: 500, color: CREAM, lineHeight: 1.4 }}>{idea.title}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {mode === 'custom' && (
            <div style={{ marginBottom: '1.2rem' }}>
              <label style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: MUTED, marginBottom: 6, display: 'block' }}>Your topic or idea</label>
              <textarea
                value={customTopic}
                onChange={e => setCustomTopic(e.target.value)}
                placeholder="e.g. 5 money habits nobody teaches you in school"
                style={{ width: '100%', background: '#0D0D0D', border: `1px solid ${BORDER}`, borderRadius: 4, padding: '10px 14px', fontSize: 11, color: CREAM, fontFamily: "'Inter', sans-serif", fontWeight: 300, outline: 'none', resize: 'vertical', minHeight: 80 }}
              />
            </div>
          )}

          {error && <div style={{ background: 'rgba(200,50,50,0.08)', border: '1px solid rgba(200,50,50,0.2)', borderRadius: 6, padding: '10px 14px', fontSize: 10, color: '#E05252', marginBottom: '1rem' }}>{error}</div>}

          <button onClick={handleGenerate} disabled={loading || !canGenerate || (mode === 'saved' && !selectedIdea) || (mode === 'custom' && !customTopic.trim())} style={{
            background: canGenerate ? GOLD : '#1C1C1C',
            color: canGenerate ? OBS : '#333',
            border: 'none', padding: '12px 28px', fontSize: 10, fontWeight: 600,
            letterSpacing: '0.2em', textTransform: 'uppercase', borderRadius: 2,
            cursor: canGenerate ? 'pointer' : 'default', fontFamily: "'Inter', sans-serif",
            opacity: loading ? 0.7 : 1, width: '100%'
          }}>
            {loading ? 'Writing your script...' : !canGenerate ? 'Upgrade for more scripts' : '▶ Generate script'}
          </button>

          {loading && (
            <div style={{ marginTop: '1.5rem' }}>
              {['Hook...', 'Setup...', 'Main content...', 'CTA...'].map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, opacity: 0.5 + (i * 0.1) }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: GOLD, animation: 'pulse 1.5s infinite', animationDelay: `${i * 0.3}s` }} />
                  <div style={{ fontSize: 10, color: MUTED }}>{s}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right — output */}
        {script && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <div style={{ fontSize: 10, color: MUTED }}>
                <span style={{ color: '#888', fontWeight: 500 }}>{script.estimatedDuration}</span> estimated
              </div>
              <button onClick={copyAll} style={{
                background: copied === 'all' ? `${GOLD}18` : 'transparent',
                border: `1px solid ${copied === 'all' ? GOLD + '55' : '#2A2A2A'}`,
                color: copied === 'all' ? GOLD : MUTED,
                padding: '6px 16px', fontSize: 9, letterSpacing: '0.15em',
                textTransform: 'uppercase', borderRadius: 2, cursor: 'pointer',
                fontFamily: "'Inter', sans-serif"
              }}>{copied === 'all' ? '✓ Copied all' : 'Copy full script'}</button>
            </div>

            <Section label="Hook (first 3 seconds)" content={script.hook} copyKey="hook" />
            <Section label="Setup" content={script.setup} copyKey="setup" />
            <Section label="Main content" content={script.mainContent} copyKey="main" />
            <Section label="Call to action" content={script.cta} copyKey="cta" />

            {script.tips && script.tips.length > 0 && (
              <div>
                <div style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: GOLD, fontWeight: 600, marginBottom: 10 }}>Filming tips</div>
                {script.tips.map((tip, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 7, fontSize: 10, color: '#666' }}>
                    <span style={{ color: GOLD, flexShrink: 0 }}>→</span>{tip}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:0.3} 50%{opacity:1} }`}</style>
    </div>
  )
}
