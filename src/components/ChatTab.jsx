import { useState, useRef, useEffect } from 'react'
import { chatWithStrategist } from '../lib/claude'
import { PLANS, GOLD, OBS, CREAM, MUTED, BORDER, SURFACE } from '../lib/config'
import { useToast } from './Toast'

const STARTERS = [
  'Why am I not growing despite posting daily?',
  'What content should I double down on?',
  'How do I get my first brand deal?',
  'Write me a 30-day content plan',
  'How do I go viral on Instagram Reels?',
  'What hooks work best for my niche?'
]

export default function ChatTab({ user, profile, plan, usage, refreshUsage }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)
  const toast = useToast()

  const planConfig = PLANS[plan]
  const limit = planConfig?.limits?.chat
  const remaining = limit === -1 ? '∞' : Math.max(0, limit - (usage.chat || 0))
  const canChat = limit === -1 || (usage.chat || 0) < limit

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])

  const send = async (text) => {
    const msg = text || input.trim()
    if (!msg || loading || !canChat) return
    setInput('')
    const newMessages = [...messages, { role: 'user', content: msg }]
    setMessages(newMessages)
    setLoading(true)
    try {
      const reply = await chatWithStrategist(newMessages, profile, plan, user?.id || 'anon')
      setMessages([...newMessages, { role: 'assistant', content: reply }])
      refreshUsage()
    } catch (err) {
      setMessages([...newMessages, { role: 'assistant', content: 'Something went wrong. Try again.' }])
      toast('Message failed', 'error')
    }
    setLoading(false)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const handleKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }

  return (
    <div style={{ height: 'calc(100vh - 113px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '1.2rem 2rem', borderBottom: `1px solid ${BORDER}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, background: 'rgba(0,0,0,0.2)' }}>
        <div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 300 }}>
            AI <em className="gradient-gold">strategist.</em>
          </div>
          <div style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>
            {remaining === '∞' ? 'Unlimited messages' : `${remaining} messages remaining`}
          </div>
        </div>
        {messages.length > 0 && (
          <button onClick={() => setMessages([])} className="btn-outline" style={{ padding: '6px 14px', fontSize: 9 }}>Clear</button>
        )}
      </div>

      {/* Messages area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 2rem' }}>
        {messages.length === 0 && (
          <div className="page-enter">
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: `${GOLD}18`, border: `1px solid ${GOLD}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, margin: '0 auto 14px', color: GOLD }}>◇</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 300, color: MUTED, marginBottom: 6 }}>Your personal content strategist.</div>
              <div style={{ fontSize: 10, color: '#333' }}>Knows your niche, audience, region. Ask anything.</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8, maxWidth: 580, margin: '0 auto' }}>
              {STARTERS.map((s, i) => (
                <button key={i} onClick={() => send(s)}
                  className="card-interactive"
                  style={{ animationDelay: `${i * 0.05}s`, background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 8, padding: '12px 14px', fontSize: 10, color: MUTED, textAlign: 'left', cursor: 'pointer', fontFamily: "'Inter', sans-serif", fontWeight: 300, lineHeight: 1.6, width: '100%' }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className="anim-fadeUp" style={{ animationDelay: `${i * 0.02}s`, marginBottom: '1.2rem', display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            {m.role === 'assistant' && (
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: `${GOLD}18`, border: `1px solid ${GOLD}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: GOLD, marginRight: 10, flexShrink: 0, marginTop: 2 }}>AI</div>
            )}
            <div style={{
              maxWidth: '72%', padding: '12px 16px',
              borderRadius: m.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
              background: m.role === 'user' ? `linear-gradient(135deg, ${GOLD}22, ${GOLD}12)` : SURFACE,
              border: `1px solid ${m.role === 'user' ? GOLD + '33' : BORDER}`,
              fontSize: 12, color: m.role === 'user' ? '#E8D5A3' : '#888',
              lineHeight: 1.75, whiteSpace: 'pre-wrap',
              boxShadow: m.role === 'user' ? `0 2px 12px ${GOLD}15` : 'none'
            }}>{m.content}</div>
          </div>
        ))}

        {loading && (
          <div className="anim-fadeIn" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.2rem' }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: `${GOLD}18`, border: `1px solid ${GOLD}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: GOLD, flexShrink: 0 }}>AI</div>
            <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '14px 14px 14px 4px', padding: '12px 16px', display: 'flex', gap: 5, alignItems: 'center' }}>
              <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '1rem 2rem', borderTop: `1px solid ${BORDER}`, flexShrink: 0, background: 'rgba(0,0,0,0.2)' }}>
        {!canChat ? (
          <div style={{ textAlign: 'center', padding: '1rem', background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 10, color: MUTED }}>
            Monthly limit reached. <span style={{ color: GOLD, cursor: 'pointer' }}>Upgrade to Pro for unlimited →</span>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
              className="input-calm"
              placeholder="Ask your strategist anything... (Enter to send)"
              style={{ flex: 1, background: '#0D0D0D', border: `1px solid ${BORDER}`, borderRadius: 10, padding: '10px 14px', fontSize: 11, color: CREAM, fontFamily: "'Inter', sans-serif", fontWeight: 300, outline: 'none', resize: 'none', minHeight: 44, maxHeight: 120 }}
              rows={1} />
            <button onClick={() => send()} disabled={!input.trim() || loading}
              className="btn-gold"
              style={{ padding: '10px 20px', height: 44, opacity: input.trim() && !loading ? 1 : 0.4, fontSize: 11 }}>↑</button>
          </div>
        )}
      </div>
    </div>
  )
}
