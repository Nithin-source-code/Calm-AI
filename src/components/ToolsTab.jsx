import { useState } from 'react'
import { analyseViralPost, scoreHook, repurposeToAllPlatforms } from '../lib/aiFeatures'
import { GOLD, OBS, CREAM, MUTED, BORDER, SURFACE } from '../lib/config'
import { useToast } from './Toast'

const TOOLS = [
  { id: 'viral', label: 'Viral analyser', icon: '🔬', desc: 'Paste any viral post — AI breaks down why it worked' },
  { id: 'hook', label: 'Hook scorer', icon: '⚡', desc: 'Score your hook 0–100 and get improved versions' },
  { id: 'repurpose', label: 'All platforms', icon: '✦', desc: 'Turn one idea into content for every platform' }
]

export default function ToolsTab({ user, profile, plan, savedIdeas }) {
  const [active, setActive] = useState('viral')
  const [input, setInput] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedIdea, setSelectedIdea] = useState(null)
  const [copied, setCopied] = useState('')
  const toast = useToast()

  const copy = (text, key) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    toast('Copied!')
    setTimeout(() => setCopied(''), 2000)
  }

  const CopyBtn = ({ text, id }) => (
    <button onClick={() => copy(text, id)} style={{ background: 'transparent', border: 'none', color: copied === id ? GOLD : '#444', fontSize: 8, cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: "'Inter', sans-serif", padding: '2px 6px' }}>
      {copied === id ? '✓' : 'copy'}
    </button>
  )

  const handleRun = async () => {
    setError('')
    setResult(null)
    setLoading(true)
    try {
      const uid = user?.id || 'anon'
      if (active === 'viral') {
        if (!input.trim()) throw new Error('Paste a viral post or video title first')
        const r = await analyseViralPost(input, profile, plan, uid)
        if (!r) throw new Error('Analysis failed. Try again.')
        setResult(r)
      } else if (active === 'hook') {
        if (!input.trim()) throw new Error('Enter your hook first')
        const r = await scoreHook(input, profile, plan, uid)
        if (!r) throw new Error('Scoring failed. Try again.')
        setResult(r)
      } else if (active === 'repurpose') {
        const idea = selectedIdea || (input.trim() ? { title: input, hook: input } : null)
        if (!idea) throw new Error('Select a saved idea or enter your idea title')
        const r = await repurposeToAllPlatforms(idea, profile, plan, uid)
        if (!r) throw new Error('Repurposing failed. Try again.')
        setResult(r)
      }
    } catch (err) {
      setError(err.message)
      toast(err.message, 'error')
    }
    setLoading(false)
  }

  const ScoreRing = ({ score }) => {
    const color = score >= 80 ? GOLD : score >= 60 ? '#888' : '#E05252'
    const grade = score >= 90 ? 'A+' : score >= 80 ? 'A' : score >= 70 ? 'B+' : score >= 60 ? 'B' : 'C'
    return (
      <div style={{ textAlign: 'center', padding: '1.5rem' }}>
        <div style={{ fontSize: 56, fontWeight: 600, color, lineHeight: 1 }}>{score}</div>
        <div style={{ fontSize: 16, color, marginTop: 4 }}>{grade}</div>
        <div style={{ fontSize: 9, color: MUTED, marginTop: 6, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Hook score</div>
        {result?.scoreBreakdown && (
          <div style={{ marginTop: '1.2rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Object.entries(result.scoreBreakdown).map(([k, v]) => (
              <div key={k}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: 9, color: MUTED, textTransform: 'capitalize', letterSpacing: '0.1em' }}>{k}</span>
                  <span style={{ fontSize: 9, color: '#888' }}>{v}</span>
                </div>
                <div style={{ height: 3, background: '#1C1C1C', borderRadius: 2 }}>
                  <div style={{ width: `${v}%`, height: '100%', background: v >= 75 ? GOLD : '#444', borderRadius: 2, transition: 'width 0.8s ease' }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  const ResultSection = ({ label, content, copyKey }) => (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <div style={{ fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: GOLD, fontWeight: 600 }}>{label}</div>
        {content && <CopyBtn text={typeof content === 'string' ? content : content.join('\n')} id={copyKey} />}
      </div>
      <div style={{ background: '#0D0D0D', borderLeft: `2px solid ${BORDER}`, borderRadius: '0 4px 4px 0', padding: '10px 12px', fontSize: 11, color: '#888', lineHeight: 1.7 }}>
        {Array.isArray(content)
          ? content.map((c, i) => <div key={i} style={{ marginBottom: 6, display: 'flex', gap: 8 }}><span style={{ color: GOLD, flexShrink: 0 }}>{i + 1}.</span>{c}</div>)
          : content}
      </div>
    </div>
  )

  const inputPlaceholder = {
    viral: 'Paste a viral post, video title, or caption here...',
    hook: 'Type or paste your hook here...',
    repurpose: 'Or type your idea title here...'
  }

  const btnLabel = {
    viral: loading ? 'Analysing...' : '🔬 Analyse this post',
    hook: loading ? 'Scoring...' : '⚡ Score my hook',
    repurpose: loading ? 'Repurposing...' : '✦ Repurpose to all platforms'
  }

  return (
    <div style={{ padding: '1.5rem', maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 300, marginBottom: 4 }}>
          Creator <em style={{ color: GOLD }}>tools.</em>
        </div>
        <div style={{ fontSize: 10, color: MUTED }}>Free AI tools to make your content sharper</div>
      </div>

      {/* Tool selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {TOOLS.map(t => (
          <button key={t.id} onClick={() => { setActive(t.id); setResult(null); setInput(''); setError('') }} style={{
            background: active === t.id ? `${GOLD}18` : 'transparent',
            border: `1px solid ${active === t.id ? GOLD + '55' : '#2A2A2A'}`,
            color: active === t.id ? GOLD : MUTED, padding: '8px 16px', fontSize: 9,
            letterSpacing: '0.15em', textTransform: 'uppercase', borderRadius: 2,
            cursor: 'pointer', fontFamily: "'Inter', sans-serif",
            display: 'flex', alignItems: 'center', gap: 6
          }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: result ? '1fr 1.4fr' : '1fr', gap: 24 }}>
        {/* Input */}
        <div>
          <div style={{ fontSize: 10, color: MUTED, marginBottom: 12, lineHeight: 1.7 }}>
            {TOOLS.find(t => t.id === active)?.desc}
          </div>

          {active === 'repurpose' && savedIdeas?.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: MUTED, marginBottom: 8 }}>From saved idea</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 180, overflowY: 'auto' }}>
                {savedIdeas.slice(0, 6).map((idea, i) => (
                  <div key={i} onClick={() => setSelectedIdea(idea)} style={{
                    background: SURFACE, border: `1px solid ${selectedIdea?.title === idea.title ? GOLD + '66' : BORDER}`,
                    borderRadius: 6, padding: '8px 12px', cursor: 'pointer', transition: 'border-color 0.15s'
                  }}>
                    <div style={{ fontSize: 10, fontWeight: 500, color: CREAM, lineHeight: 1.4 }}>{idea.title}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 9, color: '#333', marginTop: 8 }}>— or enter your own below —</div>
            </div>
          )}

          <textarea
            value={input}
            onChange={e => { setInput(e.target.value); if (active === 'repurpose') setSelectedIdea(null) }}
            placeholder={inputPlaceholder[active]}
            style={{ width: '100%', background: '#0D0D0D', border: `1px solid ${BORDER}`, borderRadius: 6, padding: '12px 14px', fontSize: 11, color: CREAM, fontFamily: "'Inter', sans-serif", fontWeight: 300, outline: 'none', resize: 'vertical', minHeight: 100, marginBottom: 12 }}
          />

          {error && (
            <div style={{ background: 'rgba(200,50,50,0.08)', border: '1px solid rgba(200,50,50,0.2)', borderRadius: 6, padding: '9px 12px', fontSize: 10, color: '#E05252', marginBottom: 10 }}>{error}</div>
          )}

          <button onClick={handleRun} disabled={loading} style={{
            width: '100%', background: GOLD, color: OBS, border: 'none', padding: '12px',
            fontSize: 10, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase',
            borderRadius: 2, cursor: loading ? 'default' : 'pointer', fontFamily: "'Inter', sans-serif",
            opacity: loading ? 0.7 : 1, transition: 'opacity 0.2s'
          }}>{btnLabel[active]}</button>

          {loading && (
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['Reading the content...', 'Analysing patterns...', 'Building your version...'].map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', opacity: 0.4 + i * 0.2 }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: GOLD, animation: 'pulse 1.5s infinite', animationDelay: `${i * 0.3}s` }} />
                  <span style={{ fontSize: 10, color: MUTED }}>{s}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Results */}
        {result && (
          <div style={{ borderLeft: `1px solid ${BORDER}`, paddingLeft: 24 }}>

            {/* VIRAL ANALYSER RESULTS */}
            {active === 'viral' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                  <div style={{ fontSize: 36, fontWeight: 600, color: GOLD, lineHeight: 1 }}>{result.viralScore}</div>
                  <div>
                    <div style={{ fontSize: 10, color: MUTED, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Viral score</div>
                    <div style={{ fontSize: 10, color: '#666', marginTop: 2 }}>{result.psychologyUsed}</div>
                  </div>
                </div>
                <ResultSection label="Why it works" content={result.whyItWorks} copyKey="why" />
                <ResultSection label="Hook breakdown" content={result.hookBreakdown} copyKey="hookbd" />
                <ResultSection label="Your version" content={result.yourVersion} copyKey="yourv" />
                <ResultSection label="Your hook" content={result.yourHook} copyKey="yourh" />
                <ResultSection label="How to improve it" content={result.improvements} copyKey="improve" />
              </>
            )}

            {/* HOOK SCORER RESULTS */}
            {active === 'hook' && (
              <>
                <ScoreRing score={result.score} />
                <div style={{ marginTop: 12 }}>
                  <ResultSection label="What works" content={result.whatWorks} copyKey="works" />
                  <ResultSection label="What to fix" content={result.whatToFix} copyKey="fix" />
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: GOLD, fontWeight: 600, marginBottom: 8 }}>Improved versions</div>
                    {result.improvedVersions?.map((h, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, background: '#0D0D0D', border: `1px solid ${BORDER}`, borderRadius: 4, padding: '8px 10px', marginBottom: 6 }}>
                        <span style={{ fontSize: 11, color: '#888', lineHeight: 1.6 }}>"{h}"</span>
                        <CopyBtn text={h} id={`hv-${i}`} />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* REPURPOSE RESULTS */}
            {active === 'repurpose' && (
              <>
                {[
                  { key: 'instagram', label: '📸 Instagram', fields: [{ k: 'reelHook', l: 'Reel hook' }, { k: 'caption', l: 'Caption' }, { k: 'storyAngle', l: 'Story angle' }] },
                  { key: 'youtube', label: '▶ YouTube', fields: [{ k: 'title', l: 'Title' }, { k: 'thumbnail', l: 'Thumbnail concept' }, { k: 'hook', l: 'Opening hook' }] },
                  { key: 'twitter', label: '✕ Twitter/X', fields: [{ k: 'tweet', l: 'Tweet' }] },
                  { key: 'shorts', label: '⚡ Shorts', fields: [{ k: 'hook', l: 'Hook' }, { k: 'structure', l: 'Structure' }] },
                  { key: 'linkedin', label: '💼 LinkedIn', fields: [{ k: 'hook', l: 'Opening' }, { k: 'angle', l: 'Angle' }] },
                ].map(platform => (
                  <div key={platform.key} style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 10, fontWeight: 500, color: CREAM, marginBottom: 8 }}>{platform.label}</div>
                    {platform.fields.map(f => result[platform.key]?.[f.k] && (
                      <div key={f.k} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, background: '#0D0D0D', borderLeft: `2px solid ${BORDER}`, padding: '8px 10px', marginBottom: 5, borderRadius: '0 4px 4px 0' }}>
                        <div>
                          <div style={{ fontSize: 8, color: GOLD, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 3 }}>{f.l}</div>
                          <div style={{ fontSize: 10, color: '#888', lineHeight: 1.6 }}>{result[platform.key][f.k]}</div>
                        </div>
                        <CopyBtn text={result[platform.key][f.k]} id={`${platform.key}-${f.k}`} />
                      </div>
                    ))}
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:0.3}50%{opacity:1}}`}</style>
    </div>
  )
}
