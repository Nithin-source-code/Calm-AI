import { useState, useEffect, useCallback } from 'react'
import { PLANS } from '../lib/config'
import { useColors } from '../lib/theme'
import { getUsage, getSavedIdeas, updateProfile } from '../lib/supabase'
import IdeasTab from '../components/IdeasTab'
import ScriptsTab from '../components/ScriptsTab'
import CaptionsTab from '../components/CaptionsTab'
import TrendsTab from '../components/TrendsTab'
import ChatTab from '../components/ChatTab'
import CalendarTab from '../components/CalendarTab'
import ToolsTab from '../components/ToolsTab'
import { StreakWidget, MonthlyRecap } from '../components/StreakRecap'
import { ToastProvider, useToast } from '../components/Toast'
import { useTheme } from '../lib/theme'
import Logo from '../components/Logo'

const TABS = [
  { id: 'ideas',    label: 'Ideas',    icon: '✦' },
  { id: 'scripts',  label: 'Scripts',  icon: '▶' },
  { id: 'captions', label: 'Captions', icon: '✍' },
  { id: 'trends',   label: 'Trends',   icon: '⬆', lockedOn: ['starter'] },
  { id: 'chat',     label: 'AI Chat',  icon: '◇', lockedOn: ['starter'] },
  { id: 'tools',    label: 'Tools',    icon: '⚡' },
  { id: 'calendar', label: 'Calendar', icon: '◫' }
]

// Mobile bottom nav - only 5 most used
const MOB_TABS = [
  { id: 'ideas',    label: 'Ideas',    icon: '✦' },
  { id: 'scripts',  label: 'Scripts',  icon: '▶' },
  { id: 'captions', label: 'Captions', icon: '✍' },
  { id: 'chat',     label: 'Chat',     icon: '◇' },
  { id: 'tools',    label: 'Tools',    icon: '⚡' },
]

function ThemeToggle() {
  const { dark, toggle } = useTheme()
  return (
    <button className={`theme-toggle ${dark ? 'on' : ''}`} onClick={toggle} title={dark ? 'Switch to light mode' : 'Switch to dark mode'} />
  )
}

function UpgradeModal({ plan, onClose }) {
  const { GOLD, OBS, BORDER, SURFACE, MUTED } = useColors()
  const plans = [
    { id: 'growth', name: 'Growth', priceINR: '₹699', features: ['40 ideas/month', '10 scripts/month', 'Viral score + reasoning', 'Trend radar', 'AI chat — 30 msgs'] },
    { id: 'pro',    name: 'Pro',    priceINR: '₹1,499', features: ['Unlimited everything', 'Daily trend radar', 'Unlimited AI chat', '10 hooks per idea', 'Content series planner'] }
  ]
  const [sel, setSel] = useState('growth')
  const handlePay = () => {
    const rzpKey = import.meta.env.VITE_RAZORPAY_KEY_ID
    if (!rzpKey) { alert('Payments coming soon! Email calm@calmcreatives.com to upgrade manually.'); return }
    const amount = sel === 'growth' ? 69900 : 149900
    const rzp = new window.Razorpay({ key: rzpKey, amount, currency: 'INR', name: 'Calm AI', description: `${sel} plan`, theme: { color: GOLD }, handler: () => { alert('Payment received! Your plan will update shortly.'); onClose() } })
    rzp.open()
  }
  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose() }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '1rem' }}>
      <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '2rem', width: '100%', maxWidth: 500, animation: 'scaleIn 0.25s cubic-bezier(0.34,1.56,0.64,1)' }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 400, marginBottom: 6 }}>Upgrade your plan.</div>
        <div style={{ fontSize: 11, color: MUTED, marginBottom: '1.5rem' }}>Unlock viral scores, trend radar, AI chat, and more.</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: '1.2rem' }}>
          {plans.map(p => (
            <div key={p.id} onClick={() => setSel(p.id)} style={{ background: 'var(--surface2)', border: `1px solid ${sel === p.id ? GOLD + '66' : BORDER}`, borderRadius: 10, padding: '1.2rem', cursor: 'pointer', transform: sel === p.id ? 'translateY(-2px)' : 'none', transition: 'all 0.2s ease' }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, marginBottom: 4 }}>{p.name}</div>
              <div style={{ fontSize: 22, fontWeight: 600, color: GOLD, marginBottom: 10 }}>{p.priceINR}<span style={{ fontSize: 9, color: MUTED, fontWeight: 300 }}>/mo</span></div>
              {p.features.map((f, i) => <div key={i} style={{ fontSize: 9, color: MUTED, marginBottom: 5, display: 'flex', gap: 6 }}><span style={{ color: GOLD, flexShrink: 0 }}>✓</span>{f}</div>)}
            </div>
          ))}
        </div>
        <button onClick={handlePay} style={{ width: '100%', background: GOLD, color: 'var(--bg)', border: 'none', padding: '12px', fontSize: 10, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', borderRadius: 2, cursor: 'pointer', fontFamily: "'Inter', sans-serif", transition: 'all 0.2s' }}>
          Upgrade to {plans.find(p => p.id === sel)?.name} →
        </button>
        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: MUTED, fontSize: 10, cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>Maybe later</button>
        </div>
      </div>
    </div>
  )
}

function SettingsModal({ user, profile, onSave, onClose }) {
  const { GOLD, BORDER, SURFACE, CREAM, MUTED } = useColors()
  const [form, setForm] = useState({ handle: profile?.handle || '', region: profile?.region || 'india', niches: profile?.niches || [], platforms: profile?.platforms || [], tone: profile?.tone || '', about: profile?.about || '' })
  const [saving, setSaving] = useState(false)
  const u = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const toggle = (k, v) => setForm(f => { const a = f[k] || []; return { ...f, [k]: a.includes(v) ? a.filter(x => x !== v) : [...a, v] } })
  const chip = (active) => ({ padding: '6px 12px', borderRadius: 20, fontSize: 9, cursor: 'pointer', border: `1px solid ${active ? GOLD : BORDER}`, background: active ? GOLD + '18' : 'transparent', color: active ? GOLD : MUTED, fontFamily: "'Inter', sans-serif", transition: 'all 0.2s' })
  const inp = { width: '100%', background: 'var(--input-bg)', border: `1px solid ${BORDER}`, borderRadius: 6, padding: '10px 14px', fontSize: 11, color: CREAM, fontFamily: "'Inter', sans-serif", fontWeight: 300, outline: 'none' }
  const lbl = { fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: MUTED, marginBottom: 8, display: 'block' }
  const handleSave = async () => { setSaving(true); try { await onSave(form) } catch (e) {} setSaving(false); onClose() }
  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose() }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '1rem', overflowY: 'auto' }}>
      <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '2rem', width: '100%', maxWidth: 540, maxHeight: '88vh', overflowY: 'auto' }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 400, marginBottom: '1.5rem' }}>Creator settings.</div>
        <div style={{ marginBottom: '1.2rem' }}><label style={lbl}>Handle</label><input value={form.handle} onChange={e => u('handle', e.target.value)} placeholder="@yourhandle" style={inp} /></div>
        <div style={{ marginBottom: '1.2rem' }}>
          <label style={lbl}>Region</label>
          <div style={{ display: 'flex', gap: 8 }}>{[{id:'india',l:'🇮🇳 India'},{id:'global',l:'🌍 Global'}].map(r => <button key={r.id} type="button" onClick={() => u('region', r.id)} style={chip(form.region===r.id)}>{r.l}</button>)}</div>
        </div>
        <div style={{ marginBottom: '1.2rem' }}>
          <label style={lbl}>Niches</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{['Finance','Fitness','Food','Fashion','Travel','Education','Comedy','Beauty','Business','Lifestyle','Gaming','Technology','Other'].map(n => <button key={n} type="button" onClick={() => toggle('niches', n)} style={chip((form.niches||[]).includes(n))}>{n}</button>)}</div>
        </div>
        <div style={{ marginBottom: '1.2rem' }}>
          <label style={lbl}>Tone</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{['Casual and friendly','Educational','Bold and provocative','Funny','Inspirational','Expert'].map(t => <button key={t} type="button" onClick={() => u('tone', t)} style={chip(form.tone===t)}>{t}</button>)}</div>
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={lbl}>About your content</label>
          <textarea value={form.about} onChange={e => u('about', e.target.value)} style={{ ...inp, resize: 'vertical', minHeight: 64 }} />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={handleSave} disabled={saving} style={{ flex: 1, background: '#D4A853', color: 'var(--bg)', border: 'none', padding: '11px', fontSize: 10, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', borderRadius: 2, cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>{saving ? 'Saving...' : 'Save changes'}</button>
          <button onClick={onClose} style={{ background: 'transparent', border: `1px solid ${BORDER}`, color: MUTED, padding: '11px 18px', fontSize: 10, borderRadius: 2, cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>Cancel</button>
        </div>
      </div>
    </div>
  )
}

function ShortcutsModal({ onClose }) {
  const { BORDER, MUTED, GOLD, SURFACE } = useColors()
  const shortcuts = [
    { key: 'G', action: 'Ideas tab' }, { key: 'S', action: 'Scripts tab' },
    { key: 'C', action: 'Captions tab' }, { key: 'T', action: 'Tools tab' },
    { key: '?', action: 'This help screen' }, { key: 'Esc', action: 'Close modal' },
  ]
  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose() }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 400, padding: '1rem' }}>
      <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '2rem', width: '100%', maxWidth: 340 }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 400, marginBottom: '1.5rem' }}>Keyboard shortcuts.</div>
        {shortcuts.map((s, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${BORDER}` }}>
            <span style={{ fontSize: 11, color: MUTED }}>{s.action}</span>
            <kbd style={{ background: 'var(--surface2)', border: `1px solid ${BORDER}`, borderRadius: 4, padding: '3px 8px', fontSize: 10, color: GOLD, fontFamily: 'monospace' }}>{s.key}</kbd>
          </div>
        ))}
        <button onClick={onClose} style={{ width: '100%', marginTop: '1.2rem', background: 'transparent', border: `1px solid ${BORDER}`, color: MUTED, padding: '10px', fontSize: 9, borderRadius: 2, cursor: 'pointer', fontFamily: "'Inter', sans-serif", letterSpacing: '0.15em', textTransform: 'uppercase' }}>Close</button>
      </div>
    </div>
  )
}

function DashboardInner({ user, profile: initialProfile, onLogout }) {
  const [profile, setProfile] = useState(initialProfile)
  const [activeTab, setActiveTab] = useState('ideas')
  const [prevTab, setPrevTab] = useState('')
  const [usage, setUsage] = useState({ ideas: 0, scripts: 0, chat: 0, captions: 0 })
  const [savedIdeas, setSavedIdeas] = useState([])
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showRecap, setShowRecap] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const toast = useToast()
  const { dark, toggle: toggleTheme } = useTheme()
  const C = useColors()

  const plan = profile?.plan || 'starter'
  const planConfig = PLANS[plan]

  useEffect(() => {
    if (user) {
      getUsage(user.id).then(setUsage)
      getSavedIdeas(user.id).then(ideas => setSavedIdeas(ideas.map(r => r.idea_data || r)))
      const lastRecap = localStorage.getItem('calm_last_recap')
      const thisMonth = new Date().toISOString().slice(0, 7)
      if (lastRecap !== thisMonth && profile?.joined_at) {
        const joinMonth = new Date(profile.joined_at).toISOString().slice(0, 7)
        if (joinMonth !== thisMonth) { setTimeout(() => setShowRecap(true), 2000); localStorage.setItem('calm_last_recap', thisMonth) }
      }
    }
  }, [user])

  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if (e.key === 'g' || e.key === 'G') switchTab('ideas')
      if (e.key === 's' || e.key === 'S') switchTab('scripts')
      if (e.key === 'c' || e.key === 'C') switchTab('captions')
      if (e.key === 't' || e.key === 'T') switchTab('tools')
      if (e.key === '?') setShowShortcuts(true)
      if (e.key === 'Escape') { setShowUpgrade(false); setShowSettings(false); setShowRecap(false); setShowShortcuts(false) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const switchTab = (id) => { setPrevTab(activeTab); setActiveTab(id) }
  const refreshUsage = () => { if (user) getUsage(user.id).then(setUsage) }

  const handleTabClick = (tab) => {
    if (tab.lockedOn?.includes(plan)) { setShowUpgrade(true); return }
    switchTab(tab.id)
  }

  const handleSaveSettings = async (updates) => {
    if (user) await updateProfile(user.id, updates)
    setProfile(p => ({ ...p, ...updates }))
    toast('Settings saved ✓')
  }

  const getRemaining = (type) => {
    const limit = planConfig?.limits?.[type]
    if (limit === -1 || limit === undefined) return '∞'
    return Math.max(0, limit - (usage[type] || 0))
  }

  const tabProps = { user, profile, plan, usage, savedIdeas, setSavedIdeas, refreshUsage, onUpgrade: () => setShowUpgrade(true) }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: "'Inter', sans-serif", color: 'var(--cream)', display: 'flex', flexDirection: 'column' }}>

      {/* TOP BAR */}
      <div style={{ borderBottom: `1px solid var(--border)`, padding: '0.8rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--nav-bg)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 40, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Logo size={32} light={!dark} />
          <div style={{ width: 1, height: 12, background: 'var(--border)' }} />
          <div style={{ fontSize: 9, color: 'var(--muted)' }}>@{profile?.handle || 'creator'} {profile?.region === 'india' ? '🇮🇳' : '🌍'}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ background: 'rgba(212,168,83,0.15)', border: '1px solid rgba(212,168,83,0.3)', borderRadius: 20, padding: '3px 10px', fontSize: 8, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gold)' }}>{planConfig?.name}</div>
          <StreakWidget usage={usage} profile={profile} />
          <ThemeToggle />
          {plan !== 'pro' && <button onClick={() => setShowUpgrade(true)} style={{ background: 'transparent', border: '1px solid rgba(212,168,83,0.4)', color: 'var(--gold)', padding: '5px 10px', fontSize: 8, borderRadius: 2, cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: "'Inter', sans-serif" }}>↑ Upgrade</button>}
          <button onClick={() => setShowSettings(true)} style={{ background: 'transparent', border: `1px solid var(--border)`, color: 'var(--muted)', padding: '5px 10px', fontSize: 8, borderRadius: 2, cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>⚙</button>
          <button onClick={() => setShowShortcuts(true)} style={{ background: 'transparent', border: `1px solid var(--border)`, color: 'var(--muted)', padding: '5px 8px', fontSize: 10, borderRadius: 2, cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>?</button>
          <button onClick={onLogout} style={{ background: 'transparent', border: `1px solid var(--border)`, color: 'var(--muted)', padding: '5px 10px', fontSize: 8, borderRadius: 2, cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>Sign out</button>
        </div>
      </div>

      {/* DESKTOP TAB BAR */}
      <div className="desktop-tabs" style={{ borderBottom: `1px solid var(--border)`, padding: '0 1.5rem', display: 'flex', background: 'var(--nav-bg)', overflowX: 'auto', flexShrink: 0 }}>
        {TABS.map(tab => {
          const locked = tab.lockedOn?.includes(plan)
          const isActive = activeTab === tab.id
          return (
            <button key={tab.id} onClick={() => handleTabClick(tab)} style={{
              background: 'transparent', border: 'none',
              borderBottom: isActive ? `2px solid var(--gold)` : '2px solid transparent',
              color: locked ? 'var(--text-dim)' : isActive ? 'var(--gold)' : 'var(--muted)',
              padding: '0.8rem 1rem', fontSize: 9, fontWeight: 500, letterSpacing: '0.12em',
              textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'Inter', sans-serif",
              display: 'flex', alignItems: 'center', gap: 5,
              transition: 'color 0.2s ease', marginBottom: -1, whiteSpace: 'nowrap', flexShrink: 0
            }}>
              <span style={{ fontSize: 11 }}>{tab.icon}</span>
              {tab.label}
              {locked && <span style={{ fontSize: 7, background: 'var(--surface2)', color: 'var(--text-dim)', padding: '1px 5px', borderRadius: 2 }}>PRO</span>}
            </button>
          )
        })}
      </div>

      {/* USAGE STRIP */}
      {plan === 'starter' && (
        <div style={{ background: 'var(--surface2)', borderBottom: `1px solid var(--border)`, padding: '5px 1.5rem', display: 'flex', gap: 16, alignItems: 'center', flexShrink: 0, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 8, color: 'var(--text-dim)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>This month</span>
          {[{k:'ideas',l:'Ideas'},{k:'scripts',l:'Scripts'},{k:'captions',l:'Captions'}].map(({k,l}) => {
            const rem = getRemaining(k)
            return <span key={k} style={{ fontSize: 9, color: 'var(--muted)' }}>{l}: <span style={{ color: rem === 0 ? '#E05252' : 'var(--cream)', fontWeight: 500 }}>{rem}</span></span>
          })}
          <span onClick={() => setShowUpgrade(true)} style={{ fontSize: 8, color: 'var(--gold)', cursor: 'pointer', marginLeft: 'auto', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Upgrade →</span>
        </div>
      )}

      {/* CONTENT with smooth tab transition */}
      <div className="dash-content" style={{ flex: 1, overflow: 'auto' }}>
        <div key={activeTab} className="tab-content-enter">
          {activeTab === 'ideas'    && <IdeasTab    {...tabProps} />}
          {activeTab === 'scripts'  && <ScriptsTab  {...tabProps} />}
          {activeTab === 'captions' && <CaptionsTab {...tabProps} />}
          {activeTab === 'trends'   && <TrendsTab   {...tabProps} />}
          {activeTab === 'chat'     && <ChatTab     {...tabProps} />}
          {activeTab === 'tools'    && <ToolsTab    {...tabProps} />}
          {activeTab === 'calendar' && <CalendarTab {...tabProps} />}
        </div>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <nav className="mobile-nav">
        {MOB_TABS.map(tab => (
          <button key={tab.id} className={`mobile-nav-item ${activeTab === tab.id ? 'active' : ''}`} onClick={() => handleTabClick(tab)}>
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      {showUpgrade  && <UpgradeModal plan={plan} onClose={() => setShowUpgrade(false)} />}
      {showSettings && <SettingsModal user={user} profile={profile} onSave={handleSaveSettings} onClose={() => setShowSettings(false)} />}
      {showRecap    && <MonthlyRecap usage={usage} profile={profile} onClose={() => setShowRecap(false)} />}
      {showShortcuts && <ShortcutsModal onClose={() => setShowShortcuts(false)} />}
      <ToastProvider />
    </div>
  )
}

export default function Dashboard(props) {
  return <DashboardInner {...props} />
}
