import { useState } from 'react'
import { generateIdeas } from '../lib/claude'
import { saveIdea } from '../lib/supabase'
import { PLANS, GOLD, OBS, CREAM, MUTED, BORDER, SURFACE } from '../lib/config'
import ShareCard from './ShareCard'
import { useToast } from './Toast'

export default function IdeasTab({ user, profile, plan, usage, savedIdeas, setSavedIdeas, refreshUsage, onUpgrade }) {
  const [ideas, setIdeas] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState(null)
  const [view, setView] = useState('generate')
  const [shareIdea, setShareIdea] = useState(null)
  const [copied, setCopied] = useState('')
  const [search, setSearch] = useState('')
  const [hoveredCard, setHoveredCard] = useState(null)
  const toast = useToast()
  const planConfig = PLANS[plan]

  const handleGenerate = async () => {
    setError('')
    setLoading(true)
    setIdeas([])
    setExpanded(null)
    try {
      const result = await generateIdeas(profile, plan, user?.id || 'anon')
      if (!result?.ideas?.length) throw new Error('No ideas generated. Try again.')
      setIdeas(result.ideas)
      refreshUsage()
    } catch (err) {
      setError(err.message || 'Generation failed. Please try again.')
      toast(err.message || 'Generation failed', 'error')
    }
    setLoading(false)
  }

  const handleSave = async (idea) => {
    try {
      if (user) await saveIdea(user.id, idea)
      setSavedIdeas(prev => [idea, ...prev.filter(s => s.title !== idea.title)])
      toast('Idea saved ✓')
    } catch (err) { toast('Could not save', 'error') }
  }

  const copyText = (text, key) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    toast('Copied!')
    setTimeout(() => setCopied(''), 2000)
  }

  const isSaved = (idea) => savedIdeas.some(s => s.title === idea.title)
  const limit = planConfig?.limits?.ideas
  const remaining = limit === -1 ? '∞' : Math.max(0, limit - (usage.ideas || 0))
  const canGenerate = limit === -1 || (usage.ideas || 0) < limit

  const filteredSaved = savedIdeas.filter(i =>
    !search || i.title?.toLowerCase().includes(search.toLowerCase())
  )

  const CopyBtn = ({ text, id }) => (
    <button onClick={e => { e.stopPropagation(); copyText(text, id) }} style={{
      background: copied === id ? 'rgba(201,168,76,0.15)' : 'transparent',
      border: `1px solid ${copied === id ? GOLD + '55' : '#1C1C1C'}`,
      color: copied === id ? GOLD : '#333', fontSize: 8, cursor: 'pointer',
      letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: "'Inter', sans-serif",
      padding: '3px 8px', borderRadius: 3, flexShrink: 0,
      transition: 'all 0.15s ease'
    }}>{copied === id ? '✓' : 'copy'}</button>
  )

  return (
    <div className="page-enter" style={{ padding: '1.5rem', maxWidth: 920, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 300, marginBottom: 4, lineHeight: 1 }}>
            Viral idea <em className="gradient-gold">engine.</em>
          </div>
          <div style={{ fontSize: 10, color: MUTED }}>
            <span style={{ color: remaining === 0 ? '#E05252' : '#888', fontWeight: 500 }}>{remaining}</span> ideas remaining · {profile?.region === 'india' ? '🇮🇳' : '🌍'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['generate', 'saved'].map(v => (
            <button key={v} onClick={() => setView(v)} className="btn-outline" style={{
              padding: '7px 14px',
              background: view === v ? 'rgba(201,168,76,0.12)' : 'transparent',
              borderColor: view === v ? GOLD + '55' : '#2A2A2A',
              color: view === v ? GOLD : MUTED,
              fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase',
              borderRadius: 2, fontFamily: "'Inter', sans-serif",
              transition: 'all 0.2s ease'
            }}>
              {v === 'saved' ? `Saved (${savedIdeas.length})` : 'Generate'}
            </button>
          ))}
        </div>
      </div>

      {view === 'generate' && (
        <>
          <div style={{ display: 'flex', gap: 10, marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <button onClick={handleGenerate} disabled={loading || !canGenerate}
              className="btn-gold"
              style={{ padding: '12px 28px', opacity: loading ? 0.75 : 1, display: 'flex', alignItems: 'center', gap: 8 }}>
              {loading ? <><span className="spinner" style={{ width: 12, height: 12, borderWidth: 1.5 }} /> Generating...</> : '✦ Generate 6 ideas'}
            </button>
            {!canGenerate && (
              <button onClick={onUpgrade} style={{ background: 'transparent', border: `1px solid ${GOLD}44`, color: GOLD, padding: '12px 18px', fontSize: 9, borderRadius: 2, cursor: 'pointer', fontFamily: "'Inter', sans-serif", letterSpacing: '0.12em', textTransform: 'uppercase', transition: 'all 0.2s' }}>
                Upgrade for more →
              </button>
            )}
          </div>

          {error && <div className="anim-slideDown" style={{ background: 'rgba(200,50,50,0.08)', border: '1px solid rgba(200,50,50,0.2)', borderRadius: 6, padding: '10px 14px', fontSize: 10, color: '#E05252', marginBottom: '1rem' }}>{error}</div>}

          {/* Animated skeleton loading */}
          {loading && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '1.4rem', height: 160, opacity: 1 - i * 0.08 }}>
                  <div className="skeleton" style={{ width: '45%', height: 8, marginBottom: 14 }} />
                  <div className="skeleton" style={{ width: '85%', height: 13, marginBottom: 10 }} />
                  <div className="skeleton" style={{ width: '70%', height: 9, marginBottom: 8 }} />
                  <div className="skeleton" style={{ width: '55%', height: 9, marginBottom: 16 }} />
                  <div className="skeleton" style={{ width: '100%', height: 4 }} />
                </div>
              ))}
            </div>
          )}

          {/* Ideas grid with stagger animation */}
          {!loading && ideas.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
              {ideas.map((idea, i) => (
                <div key={i}
                  className={`card-interactive idea-card-enter stagger-${i + 1}`}
                  onMouseEnter={() => setHoveredCard(i)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{
                    background: hoveredCard === i
                      ? 'linear-gradient(135deg, #131310 0%, #0F0F0C 100%)'
                      : SURFACE,
                    border: `1px solid ${expanded === i ? GOLD + '55' : hoveredCard === i ? GOLD + '33' : BORDER}`,
                    borderRadius: 12, overflow: 'hidden',
                    boxShadow: hoveredCard === i ? `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(201,168,76,0.08)` : 'none'
                  }}>
                  {/* Card header */}
                  <div style={{ padding: '1.2rem', cursor: 'pointer' }} onClick={() => setExpanded(expanded === i ? null : i)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                      <div style={{ fontSize: 8, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#3A3A3A', border: '1px solid #1C1C1C', padding: '2px 8px', borderRadius: 10 }}>{idea.platform}</div>
                      <div style={{ fontSize: 8, color: '#3A3A3A', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{idea.emotion}</div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: CREAM, lineHeight: 1.45 }}>{idea.title}</div>
                      <CopyBtn text={idea.title} id={`t-${i}`} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 12 }}>
                      <div style={{ fontSize: 10, color: '#666', lineHeight: 1.65, fontStyle: 'italic' }}>"{idea.hook}"</div>
                      <CopyBtn text={idea.hook} id={`h-${i}`} />
                    </div>

                    {/* Animated viral score */}
                    {idea.viralScore && (
                      <div style={{ marginBottom: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <div style={{ fontSize: 8, color: MUTED, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Viral score</div>
                          <div style={{ fontSize: 10, fontWeight: 600, color: idea.viralScore > 75 ? GOLD : MUTED }}>{idea.viralScore}</div>
                        </div>
                        <div style={{ height: 3, background: '#1C1C1C', borderRadius: 2 }}>
                          <div className="score-bar-fill" style={{ width: hoveredCard === i || expanded === i ? `${idea.viralScore}%` : '0%', height: '100%', background: idea.viralScore > 75 ? GOLD : '#555', borderRadius: 2 }} />
                        </div>
                      </div>
                    )}

                    <div style={{ fontSize: 9, color: '#2E2E2E', fontStyle: 'italic', lineHeight: 1.5 }}>{idea.whyViral}</div>
                  </div>

                  {/* Expanded */}
                  {expanded === i && (
                    <div className="anim-slideDown" style={{ borderTop: `1px solid ${BORDER}`, padding: '1rem 1.2rem' }}>
                      {idea.viralScore && idea.scoreReasons && (
                        <div style={{ marginBottom: 14 }}>
                          <div style={{ fontSize: 8, letterSpacing: '0.15em', textTransform: 'uppercase', color: GOLD, fontWeight: 600, marginBottom: 8 }}>Why it will work</div>
                          {idea.scoreReasons.map((r, j) => (
                            <div key={j} style={{ fontSize: 10, color: '#666', marginBottom: 6, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                              <span style={{ color: GOLD, flexShrink: 0, marginTop: 1 }}>✓</span>{r}
                            </div>
                          ))}
                        </div>
                      )}
                      <div>
                        <div style={{ fontSize: 8, letterSpacing: '0.15em', textTransform: 'uppercase', color: MUTED, marginBottom: 8 }}>Hook variations</div>
                        {idea.hooks?.map((h, j) => (
                          <div key={j} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontSize: 10, color: '#555', marginBottom: 6, padding: '7px 10px', background: '#0A0A0A', borderRadius: 5, gap: 8, border: `1px solid ${BORDER}` }}>
                            <span style={{ lineHeight: 1.6 }}>"{h}"</span>
                            <CopyBtn text={h} id={`hv-${i}-${j}`} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ borderTop: `1px solid ${BORDER}`, padding: '9px 1.2rem', display: 'flex', gap: 7, flexWrap: 'wrap', background: 'rgba(0,0,0,0.2)' }}>
                    <button onClick={() => handleSave(idea)} style={{
                      background: isSaved(idea) ? 'rgba(201,168,76,0.15)' : 'transparent',
                      border: `1px solid ${isSaved(idea) ? GOLD + '55' : '#2A2A2A'}`,
                      color: isSaved(idea) ? GOLD : MUTED, padding: '5px 12px', fontSize: 8,
                      letterSpacing: '0.1em', textTransform: 'uppercase', borderRadius: 2, cursor: 'pointer',
                      fontFamily: "'Inter', sans-serif", transition: 'all 0.2s ease'
                    }}>{isSaved(idea) ? '✓ Saved' : 'Save'}</button>
                    <button onClick={() => setExpanded(expanded === i ? null : i)} style={{ background: 'transparent', border: `1px solid #2A2A2A`, color: MUTED, padding: '5px 12px', fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase', borderRadius: 2, cursor: 'pointer', fontFamily: "'Inter', sans-serif", transition: 'all 0.15s' }}>
                      {expanded === i ? 'Collapse' : 'Expand'}
                    </button>
                    <button onClick={() => setShareIdea(idea)} style={{ background: 'transparent', border: `1px solid #2A2A2A`, color: MUTED, padding: '5px 12px', fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase', borderRadius: 2, cursor: 'pointer', fontFamily: "'Inter', sans-serif", marginLeft: 'auto', transition: 'all 0.15s' }}>Share ↗</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && ideas.length === 0 && (
            <div className="anim-fadeIn" style={{ textAlign: 'center', padding: '5rem 2rem', border: `1px dashed #1C1C1C`, borderRadius: 12 }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>✦</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 300, color: MUTED, marginBottom: 8 }}>Ready when you are.</div>
              <div style={{ fontSize: 10, color: '#2A2A2A', marginBottom: '1.5rem' }}>Hit generate — 6 viral ideas built for your exact channel.</div>
              <button onClick={handleGenerate} disabled={!canGenerate} className="btn-gold" style={{ padding: '11px 24px' }}>✦ Generate ideas</button>
            </div>
          )}
        </>
      )}

      {view === 'saved' && (
        <div className="page-enter">
          {savedIdeas.length > 0 && (
            <input placeholder="Search saved ideas..." value={search} onChange={e => setSearch(e.target.value)}
              className="input-calm"
              style={{ width: '100%', maxWidth: 320, background: '#0D0D0D', border: `1px solid ${BORDER}`, borderRadius: 6, padding: '9px 14px', fontSize: 10, color: CREAM, fontFamily: "'Inter', sans-serif", outline: 'none', marginBottom: '1.2rem' }} />
          )}
          {filteredSaved.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', border: `1px dashed #1C1C1C`, borderRadius: 12 }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>📋</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 300, color: MUTED, marginBottom: 6 }}>{search ? 'No matches.' : 'Nothing saved yet.'}</div>
              <div style={{ fontSize: 10, color: '#2A2A2A' }}>{search ? 'Try a different search.' : 'Save ideas from the generate tab and they\'ll live here.'}</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
              {filteredSaved.map((idea, i) => (
                <div key={i} className="card-interactive idea-card-enter" style={{ animationDelay: `${i * 0.04}s`, opacity: 0, background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '1.2rem' }}>
                  <div style={{ fontSize: 8, color: '#3A3A3A', border: '1px solid #1C1C1C', padding: '2px 8px', borderRadius: 10, display: 'inline-block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{idea.platform}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: CREAM, lineHeight: 1.45 }}>{idea.title}</div>
                    <CopyBtn text={idea.title} id={`sv-${i}`} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 12 }}>
                    <div style={{ fontSize: 10, color: MUTED, fontStyle: 'italic' }}>"{idea.hook}"</div>
                    <CopyBtn text={idea.hook} id={`shk-${i}`} />
                  </div>
                  <div style={{ display: 'flex', gap: 7 }}>
                    <button onClick={() => setShareIdea(idea)} style={{ background: 'transparent', border: `1px solid #2A2A2A`, color: MUTED, padding: '5px 12px', fontSize: 8, borderRadius: 2, cursor: 'pointer', fontFamily: "'Inter', sans-serif", letterSpacing: '0.1em', textTransform: 'uppercase', transition: 'all 0.15s' }}>Share</button>
                    <button onClick={() => setSavedIdeas(prev => prev.filter((_, idx) => idx !== i))} style={{ background: 'transparent', border: `1px solid #2A2A2A`, color: '#333', padding: '5px 12px', fontSize: 8, borderRadius: 2, cursor: 'pointer', fontFamily: "'Inter', sans-serif", transition: 'all 0.15s' }}>Remove</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {shareIdea && <ShareCard idea={shareIdea} profile={profile} onClose={() => setShareIdea(null)} />}
    </div>
  )
}
