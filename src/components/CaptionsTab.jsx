import { useState } from 'react'
import { generateCaptions } from '../lib/claude'
import { PLANS, GOLD, OBS, CREAM, MUTED, BORDER, SURFACE } from '../lib/config'

export default function CaptionsTab({ user, profile, plan, usage, savedIdeas, refreshUsage }) {
  const [selectedIdea, setSelectedIdea] = useState(null)
  const [customTopic, setCustomTopic] = useState('')
  const [captions, setCaptions] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState('')
  const [mode, setMode] = useState('saved')
  const [activeTab, setActiveTab] = useState('instagram')

  const planConfig = PLANS[plan]
  const limit = planConfig?.limits?.captions
  const remaining = limit === -1 ? '∞' : Math.max(0, limit - (usage.captions || 0))
  const canGenerate = limit === -1 || (usage.captions || 0) < limit

  const handleGenerate = async () => {
    setError('')
    setLoading(true)
    setCaptions(null)
    try {
      const idea = mode === 'saved' && selectedIdea
        ? selectedIdea
        : { title: customTopic, platform: profile?.platforms?.[0] || 'instagram' }
      if (!idea.title) throw new Error('Select an idea or enter a topic.')
      const result = await generateCaptions(idea, profile, plan, user?.id || 'anon')
      if (!result) throw new Error('Caption generation failed.')
      setCaptions(result)
      refreshUsage()
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  const copy = (text, key) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(''), 2000)
  }

  const outputTabs = [
    { id: 'instagram', label: 'Instagram captions', data: captions?.instagramCaptions },
    { id: 'youtube', label: 'YouTube titles', data: captions?.youtubeTitles },
    { id: 'twitter', label: 'Tweet hooks', data: captions?.tweetHooks },
    { id: 'hashtags', label: 'Hashtags', data: captions?.hashtags ? [captions.hashtags.join(' ')] : null }
  ]

  const Btn = ({ children, onClick, active }) => (
    <button onClick={onClick} style={{
      background: active ? `${GOLD}18` : 'transparent',
      border: `1px solid ${active ? GOLD + '55' : '#2A2A2A'}`,
      color: active ? GOLD : MUTED,
      padding: '7px 16px', fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase',
      borderRadius: 2, cursor: 'pointer', fontFamily: "'Inter', sans-serif"
    }}>{children}</button>
  )

  return (
    <div style={{ padding: '2rem', maxWidth: 880, margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 300, marginBottom: 6 }}>
          Caption <em style={{ color: GOLD }}>generator.</em>
        </div>
        <div style={{ fontSize: 10, color: MUTED }}>{remaining} caption sets remaining · Instagram, YouTube, Twitter in one go</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: captions ? '1fr 1.6fr' : '1fr', gap: 24 }}>
        {/* Input side */}
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: '1.2rem', flexWrap: 'wrap' }}>
            <Btn active={mode === 'saved'} onClick={() => setMode('saved')}>From saved idea</Btn>
            <Btn active={mode === 'custom'} onClick={() => setMode('custom')}>Custom topic</Btn>
          </div>

          {mode === 'saved' && savedIdeas.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: '1.2rem' }}>
              {savedIdeas.map((idea, i) => (
                <div key={i} onClick={() => setSelectedIdea(idea)} style={{
                  background: SURFACE, border: `1px solid ${selectedIdea?.title === idea.title ? GOLD + '66' : BORDER}`,
                  borderRadius: 8, padding: '10px 14px', cursor: 'pointer', transition: 'border-color 0.15s'
                }}>
                  <div style={{ fontSize: 9, color: '#444', marginBottom: 4 }}>{idea.platform?.toUpperCase()}</div>
                  <div style={{ fontSize: 11, fontWeight: 500, color: CREAM, lineHeight: 1.4 }}>{idea.title}</div>
                </div>
              ))}
            </div>
          )}

          {mode === 'saved' && savedIdeas.length === 0 && (
            <div style={{ padding: '1.5rem', background: SURFACE, border: `1px dashed ${BORDER}`, borderRadius: 8, fontSize: 10, color: MUTED, textAlign: 'center', marginBottom: '1.2rem' }}>
              Save ideas from the Ideas tab first.
            </div>
          )}

          {mode === 'custom' && (
            <div style={{ marginBottom: '1.2rem' }}>
              <textarea
                value={customTopic}
                onChange={e => setCustomTopic(e.target.value)}
                placeholder="e.g. How I saved ₹1 lakh in 6 months"
                style={{ width: '100%', background: '#0D0D0D', border: `1px solid ${BORDER}`, borderRadius: 4, padding: '10px 14px', fontSize: 11, color: CREAM, fontFamily: "'Inter', sans-serif", fontWeight: 300, outline: 'none', resize: 'vertical', minHeight: 72 }}
              />
            </div>
          )}

          {error && <div style={{ background: 'rgba(200,50,50,0.08)', border: '1px solid rgba(200,50,50,0.2)', borderRadius: 6, padding: '10px 14px', fontSize: 10, color: '#E05252', marginBottom: '1rem' }}>{error}</div>}

          <button onClick={handleGenerate} disabled={loading || !canGenerate} style={{
            background: canGenerate ? GOLD : '#1C1C1C', color: canGenerate ? OBS : '#333',
            border: 'none', padding: '12px 28px', fontSize: 10, fontWeight: 600,
            letterSpacing: '0.2em', textTransform: 'uppercase', borderRadius: 2,
            cursor: canGenerate ? 'pointer' : 'default', fontFamily: "'Inter', sans-serif",
            opacity: loading ? 0.7 : 1, width: '100%'
          }}>
            {loading ? 'Generating captions...' : !canGenerate ? 'Upgrade for more' : '✍ Generate captions'}
          </button>

          {/* Region badge */}
          <div style={{ marginTop: 12, fontSize: 9, color: '#333', letterSpacing: '0.1em' }}>
            {profile?.region === 'india' ? '🇮🇳 India-optimised — desi tone, local references' : '🌍 Global tone'}
          </div>
        </div>

        {/* Output side */}
        {captions && (
          <div>
            {/* Output tabs */}
            <div style={{ display: 'flex', gap: 0, marginBottom: 0, borderBottom: `1px solid ${BORDER}` }}>
              {outputTabs.map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                  background: 'transparent', border: 'none',
                  borderBottom: activeTab === t.id ? `1px solid ${GOLD}` : '1px solid transparent',
                  color: activeTab === t.id ? GOLD : MUTED,
                  padding: '8px 14px', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase',
                  cursor: 'pointer', fontFamily: "'Inter', sans-serif", marginBottom: -1
                }}>{t.label}</button>
              ))}
            </div>

            <div style={{ marginTop: '1rem' }}>
              {outputTabs.find(t => t.id === activeTab)?.data?.map((item, i) => (
                <div key={i} style={{ background: '#0D0D0D', border: `1px solid ${BORDER}`, borderRadius: 8, padding: '12px 14px', marginBottom: 10, position: 'relative' }}>
                  <div style={{ fontSize: 11, color: '#888', lineHeight: 1.7, paddingRight: 50 }}>{item}</div>
                  <button onClick={() => copy(item, `${activeTab}-${i}`)} style={{
                    position: 'absolute', top: 10, right: 12,
                    background: 'transparent', border: 'none',
                    color: copied === `${activeTab}-${i}` ? GOLD : '#333',
                    fontSize: 9, cursor: 'pointer', letterSpacing: '0.1em',
                    textTransform: 'uppercase', fontFamily: "'Inter', sans-serif"
                  }}>{copied === `${activeTab}-${i}` ? '✓' : 'copy'}</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
