import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { GOLD, OBS, CREAM, MUTED, BORDER, SURFACE } from '../lib/config'
import Logo from '../components/Logo'

export default function Landing() {
  const [mode, setMode] = useState('signup')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [selectedPlan, setSelectedPlan] = useState('growth')
  const [showAuth, setShowAuth] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const passwordChecks = [
    { label: 'At least 8 characters', pass: form.password.length >= 8 },
    { label: 'One uppercase letter', pass: /[A-Z]/.test(form.password) },
    { label: 'One number', pass: /[0-9]/.test(form.password) },
    { label: 'One special character (!@#$%^&*)', pass: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(form.password) },
  ]
  const passwordStrength = passwordChecks.filter(c => c.pass).length
  const passwordValid = passwordStrength === 4

  const plans = [
    {
      id: 'starter', name: 'Starter', priceINR: '₹299', priceUSD: '$9',
      desc: 'Test the waters', tag: null,
      features: [
        { text: '10 ideas / month', inc: true },
        { text: '3 scripts / month', inc: true },
        { text: '5 caption sets / month', inc: true },
        { text: '3 hooks per idea', inc: true },
        { text: 'India + Global modes', inc: true },
        { text: 'Viral score', inc: false },
        { text: 'Trend radar', inc: false },
        { text: 'AI chat', inc: false },
      ]
    },
    {
      id: 'growth', name: 'Growth', priceINR: '₹699', priceUSD: '$19',
      desc: 'For creators getting serious', tag: 'Most popular',
      features: [
        { text: '40 ideas / month', inc: true },
        { text: '10 scripts / month', inc: true },
        { text: '30 caption sets / month', inc: true },
        { text: '8 hooks per idea', inc: true },
        { text: 'Viral score + reasoning', inc: true },
        { text: 'Weekly trend radar', inc: true },
        { text: 'AI chat — 30 msgs', inc: true },
        { text: 'Agency dashboard', inc: false },
      ]
    },
    {
      id: 'pro', name: 'Pro', priceINR: '₹1,499', priceUSD: '$39',
      desc: 'No limits. Just create.', tag: 'Best value',
      features: [
        { text: 'Unlimited ideas', inc: true },
        { text: 'Unlimited scripts', inc: true },
        { text: 'Unlimited captions', inc: true },
        { text: '10 hooks per idea', inc: true },
        { text: 'Viral score + reasoning', inc: true },
        { text: 'Daily trend radar', inc: true },
        { text: 'Unlimited AI chat', inc: true },
        { text: 'Agency dashboard', inc: true },
      ]
    }
  ]

  const handleAuth = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'signup') {
        if (!form.name.trim()) throw new Error('Please enter your name')
        if (!passwordValid) throw new Error('Password does not meet all requirements')
        const { error: signupError } = await supabase.auth.signUp({
          email: form.email, password: form.password,
          options: { data: { full_name: form.name, plan: selectedPlan } }
        })
        if (signupError) throw signupError
        const { data: { user } } = await supabase.auth.getUser()
        if (user) await supabase.from('profiles').upsert({ id: user.id, full_name: form.name, email: form.email, plan: selectedPlan })
        setSuccess('Account created! Check your email to confirm, then sign in.')
      } else {
        const { error: loginError } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password })
        if (loginError) throw loginError
      }
    } catch (err) { setError(err.message || 'Something went wrong') }
    setLoading(false)
  }

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <div style={{ background: OBS, minHeight: '100vh', fontFamily: "'Inter', sans-serif", color: CREAM, overflowX: 'hidden' }}>

      {/* MOBILE CSS */}
      <style>{`
        .nav-wrap { padding: 1rem 1.5rem !important; }
        .nav-links { gap: 12px !important; }
        .nav-get { display: none; }
        .hero-wrap { padding: 4rem 1.5rem !important; min-height: auto !important; }
        .hero-h1 { font-size: clamp(40px, 10vw, 108px) !important; }
        .hero-btns { flex-direction: column !important; width: 100%; max-width: 300px; }
        .hero-btns button { width: 100% !important; }
        .features-grid { grid-template-columns: 1fr 1fr !important; gap: 0 !important; padding: 2rem 1.5rem !important; }
        .feature-item { padding: 1rem !important; border-right: none !important; border-bottom: 1px solid #1C1C1C; }
        .how-grid { grid-template-columns: 1fr !important; gap: 2rem !important; padding: 3rem 1.5rem !important; }
        .pricing-section { padding: 3rem 1.5rem !important; }
        .pricing-grid { grid-template-columns: 1fr !important; gap: 14px !important; }
        .cta-strip { padding: 3rem 1.5rem !important; }
        .footer-wrap { padding: 1.5rem !important; flex-direction: column !important; gap: 14px !important; text-align: center; }
        .modal-box { padding: 1.5rem !important; border-radius: 14px 14px 0 0 !important; position: fixed !important; bottom: 0 !important; left: 0 !important; right: 0 !important; top: auto !important; max-width: 100% !important; max-height: 92vh; overflow-y: auto; }
        .modal-outer { align-items: flex-end !important; }
        @media (min-width: 769px) {
          .nav-get { display: block !important; }
          .features-grid { grid-template-columns: repeat(4, 1fr) !important; padding: 3.5rem 4rem !important; }
          .feature-item { border-bottom: none !important; }
          .how-grid { grid-template-columns: repeat(3, 1fr) !important; padding: 6rem 4rem !important; }
          .pricing-section { padding: 6rem 4rem !important; }
          .pricing-grid { grid-template-columns: repeat(3, 1fr) !important; }
          .hero-wrap { padding: 6rem 2rem !important; min-height: 92vh !important; }
          .hero-btns { flex-direction: row !important; width: auto; }
          .hero-btns button { width: auto !important; }
          .footer-wrap { flex-direction: row !important; padding: 2rem 4rem !important; }
          .modal-box { border-radius: 14px !important; position: relative !important; bottom: auto !important; max-height: none !important; }
          .modal-outer { align-items: center !important; }
          .nav-wrap { padding: 1.5rem 4rem !important; }
        }
      `}</style>

      {/* NAV */}
      <nav className="nav-wrap" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${BORDER}`, position: 'sticky', top: 0, background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(10px)', zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <a href="https://nithin-source-code.github.io/Calm-Creatives" style={{ textDecoration: 'none' }}>
            <Logo size={36} />
          </a>
          <div style={{ width: 1, height: 12, background: BORDER }} />
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 13, letterSpacing: '0.2em', color: CREAM, textTransform: 'uppercase', opacity: 0.6 }}>AI</div>
        </div>
        <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <span onClick={() => scrollTo('pricing')} style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: MUTED, cursor: 'pointer' }}>Pricing</span>
          <span onClick={() => { setMode('login'); setShowAuth(true) }} style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#666', cursor: 'pointer' }}>Sign in</span>
          <button className="nav-get" onClick={() => { setMode('signup'); setShowAuth(true) }} style={{ background: GOLD, color: OBS, border: 'none', padding: '10px 22px', fontSize: 9, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', borderRadius: 2, cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>Get started</button>
        </div>
      </nav>

      {/* HERO */}
      <div className="hero-wrap" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: `linear-gradient(to bottom, transparent 5%, ${GOLD}25 50%, transparent 95%)`, pointerEvents: 'none' }} />
        <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: GOLD, marginBottom: '1.5rem' }}>AI for creators</div>
        <h1 className="hero-h1" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 300, lineHeight: 0.92, letterSpacing: '0.02em', marginBottom: '2rem' }}>
          Your personal AI<br /><em style={{ color: GOLD }}>content strategist.</em>
        </h1>
        <p style={{ fontSize: 12, color: '#6A6A62', maxWidth: 480, lineHeight: 2, marginBottom: '2.5rem', letterSpacing: '0.02em' }}>
          Calm AI studies your channel, understands your niche, and generates viral ideas, scripts, and hooks built specifically for you. Never generic. Never repeated.
        </p>
        <div className="hero-btns" style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => { setMode('signup'); setShowAuth(true) }} style={{ background: GOLD, color: OBS, border: 'none', padding: '13px 28px', fontSize: 10, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', borderRadius: 2, cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>Start free trial</button>
          <button onClick={() => scrollTo('pricing')} style={{ background: 'transparent', color: MUTED, border: `1px solid #2A2A2A`, padding: '13px 28px', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', borderRadius: 2, cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>See pricing</button>
        </div>
      </div>

      {/* FEATURES STRIP */}
      <div className="features-grid" style={{ borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`, display: 'grid' }}>
        {[
          { icon: '✦', title: 'Viral idea engine', note: 'Fresh ideas built for your channel. Never the same twice.' },
          { icon: '▶', title: 'Script generator', note: 'Complete scripts with hook, body, and call to action.' },
          { icon: '⬆', title: 'Trend radar', note: "What's rising in your niche before it peaks." },
          { icon: '◫', title: 'Caption generator', note: 'Instagram captions, YouTube titles, tweet hooks.' }
        ].map((f, i) => (
          <div key={i} className="feature-item" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 16, color: GOLD, marginBottom: 12 }}>{f.icon}</div>
            <div style={{ fontSize: 11, fontWeight: 500, color: CREAM, marginBottom: 6 }}>{f.title}</div>
            <div style={{ fontSize: 10, color: MUTED, lineHeight: 1.7 }}>{f.note}</div>
          </div>
        ))}
      </div>

      {/* HOW IT WORKS */}
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div className="how-grid" style={{ display: 'grid' }}>
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: GOLD, marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <span style={{ width: 20, height: 1, background: GOLD, display: 'inline-block' }} />Process<span style={{ width: 20, height: 1, background: GOLD, display: 'inline-block' }} />
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 300, lineHeight: 1.05 }}>How it <em style={{ color: GOLD }}>works.</em></h2>
          </div>
          {[
            { n: '01', t: 'Build your creator DNA', d: 'Tell us your niche, platform, tone, and audience. Your DNA personalises every single output.' },
            { n: '02', t: 'Set your region', d: 'India or Global. Indian creators get Reels-first angles, festival moments, and desi context built in.' },
            { n: '03', t: 'Generate and create', d: 'Ideas, scripts, captions, trend reports — all built specifically for you, never from a template.' }
          ].map((s, i) => (
            <div key={i}>
              <div style={{ fontSize: 9, letterSpacing: '0.3em', color: GOLD, marginBottom: 14, fontWeight: 600 }}>{s.n}</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: CREAM, marginBottom: 8 }}>{s.t}</div>
              <div style={{ fontSize: 11, color: MUTED, lineHeight: 1.8 }}>{s.d}</div>
            </div>
          ))}
        </div>
      </div>

      {/* PRICING */}
      <div id="pricing" className="pricing-section">
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: GOLD, marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <span style={{ width: 20, height: 1, background: GOLD, display: 'inline-block' }} />Pricing<span style={{ width: 20, height: 1, background: GOLD, display: 'inline-block' }} />
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 300, lineHeight: 1.05 }}>Simple, creator-first <em style={{ color: GOLD }}>pricing.</em></h2>
        </div>
        <div className="pricing-grid" style={{ display: 'grid', maxWidth: 1000, margin: '0 auto' }}>
          {plans.map(p => {
            const isSel = selectedPlan === p.id
            const isGrowth = p.id === 'growth'
            return (
              <div key={p.id} onClick={() => setSelectedPlan(p.id)} style={{
                background: isGrowth ? `linear-gradient(160deg,#141210,#0F0D0B)` : SURFACE,
                border: `1px solid ${isSel ? GOLD + '88' : isGrowth ? GOLD + '44' : BORDER}`,
                borderRadius: 12, overflow: 'hidden', cursor: 'pointer',
                transform: isSel ? 'translateY(-4px)' : 'none',
                transition: 'all 0.2s', position: 'relative'
              }}>
                {p.tag && (
                  <div style={{ position: 'absolute', top: 14, right: 14, fontSize: 8, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: isGrowth ? OBS : GOLD, background: isGrowth ? GOLD : `${GOLD}22`, border: `1px solid ${GOLD}55`, padding: '3px 9px', borderRadius: 20 }}>{p.tag}</div>
                )}
                <div style={{ padding: '1.5rem 1.4rem 1.2rem', borderBottom: `1px solid ${BORDER}` }}>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: MUTED, marginBottom: 8 }}>{p.name}</div>
                  <div style={{ fontSize: 32, fontWeight: 600, color: GOLD, lineHeight: 1, marginBottom: 3 }}>{p.priceINR}<span style={{ fontSize: 10, color: MUTED, fontWeight: 300 }}>/mo</span></div>
                  <div style={{ fontSize: 9, color: '#2A2A2A', marginBottom: 10 }}>{p.priceUSD} · billed monthly</div>
                  <div style={{ fontSize: 11, color: MUTED, fontStyle: 'italic' }}>{p.desc}</div>
                </div>
                <div style={{ padding: '1.2rem 1.4rem' }}>
                  {p.features.map((f, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, fontSize: 10, color: f.inc ? '#888' : '#252525', marginBottom: 7, alignItems: 'flex-start' }}>
                      <span style={{ color: f.inc ? GOLD : '#252525', fontSize: 9, flexShrink: 0, marginTop: 1, fontWeight: 600 }}>{f.inc ? '✓' : '—'}</span>
                      {f.text}
                    </div>
                  ))}
                </div>
                <div style={{ padding: '1rem 1.4rem', borderTop: `1px solid ${BORDER}` }}>
                  <button onClick={e => { e.stopPropagation(); setSelectedPlan(p.id); setMode('signup'); setShowAuth(true) }} style={{
                    width: '100%', background: isGrowth ? GOLD : isSel ? `${GOLD}18` : 'transparent',
                    color: isGrowth ? OBS : isSel ? GOLD : '#555',
                    border: isGrowth ? 'none' : `1px solid ${isSel ? GOLD + '55' : '#2A2A2A'}`,
                    padding: '11px', fontSize: 9, fontWeight: 600, letterSpacing: '0.15em',
                    textTransform: 'uppercase', borderRadius: 2, cursor: 'pointer',
                    fontFamily: "'Inter', sans-serif"
                  }}>Get started — {p.name}</button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="cta-strip" style={{ borderTop: `1px solid ${BORDER}`, textAlign: 'center' }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(26px, 4vw, 48px)', fontWeight: 300, marginBottom: '2rem', lineHeight: 1.1 }}>
          Your channel has more in it<br />than <em style={{ color: GOLD }}>this.</em>
        </h2>
        <button onClick={() => { setMode('signup'); setShowAuth(true) }} style={{ background: GOLD, color: OBS, border: 'none', padding: '14px 36px', fontSize: 10, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', borderRadius: 2, cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>Start now — free</button>
      </div>

      {/* FOOTER */}
      <div className="footer-wrap" style={{ borderTop: `1px solid ${BORDER}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Logo size={32} />
        <div style={{ fontSize: 9, color: GOLD, letterSpacing: '0.12em', border: `1px solid ${GOLD}33`, padding: '4px 14px', borderRadius: 20 }}>Part of Calm Creatives</div>
        <a href="https://nithin-source-code.github.io/Calm-Creatives" style={{ fontSize: 9, color: MUTED, letterSpacing: '0.15em', textTransform: 'uppercase', textDecoration: 'none' }}>Agency ↗</a>
      </div>

      {/* AUTH MODAL */}
      {showAuth && (
        <div className="modal-outer" onClick={e => { if (e.target === e.currentTarget) setShowAuth(false) }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div className="modal-box" style={{ background: '#0F0F0F', border: `1px solid ${BORDER}`, borderRadius: 14, padding: '2rem', width: '100%', maxWidth: 420 }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 300, marginBottom: 4 }}>
              {mode === 'signup' ? 'Create your account' : 'Welcome back'}
            </div>
            <div style={{ fontSize: 10, color: MUTED, marginBottom: '1.5rem' }}>
              {mode === 'signup' ? `Starting with ${plans.find(p => p.id === selectedPlan)?.name} plan` : 'Sign in to continue'}
            </div>

            {error && <div style={{ background: 'rgba(200,50,50,0.1)', border: '1px solid rgba(200,50,50,0.3)', borderRadius: 6, padding: '9px 12px', fontSize: 10, color: '#E05252', marginBottom: '1rem' }}>{error}</div>}
            {success && <div style={{ background: 'rgba(50,180,100,0.1)', border: '1px solid rgba(50,180,100,0.3)', borderRadius: 6, padding: '9px 12px', fontSize: 10, color: '#5DBE8A', marginBottom: '1rem' }}>{success}</div>}

            <form onSubmit={handleAuth}>
              {/* Google Sign In */}
              <button type="button" onClick={async () => {
                await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })
              }} style={{
                width: '100%', background: '#111', border: `1px solid #2A2A2A`, color: '#888',
                padding: '12px', fontSize: 10, borderRadius: 4, cursor: 'pointer',
                fontFamily: "'Inter', sans-serif", display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 10, marginBottom: '1rem', letterSpacing: '0.04em'
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Continue with Google
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
                <div style={{ flex: 1, height: 1, background: '#1C1C1C' }} />
                <div style={{ fontSize: 9, color: '#333' }}>or</div>
                <div style={{ flex: 1, height: 1, background: '#1C1C1C' }} />
              </div>

              {mode === 'signup' && (
                <div style={{ marginBottom: '0.9rem' }}>
                  <label style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: MUTED }}>Your name</label>
                  <input type="text" placeholder="Full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    style={{ width: '100%', background: '#0D0D0D', border: `1px solid ${BORDER}`, borderRadius: 3, padding: '11px 14px', fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 300, color: CREAM, outline: 'none', marginTop: 6 }} />
                </div>
              )}
              <div style={{ marginBottom: '0.9rem' }}>
                <label style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: MUTED }}>Email</label>
                <input type="email" placeholder="your@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  style={{ width: '100%', background: '#0D0D0D', border: `1px solid ${BORDER}`, borderRadius: 3, padding: '11px 14px', fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 300, color: CREAM, outline: 'none', marginTop: 6 }} />
              </div>
              <div style={{ marginBottom: mode === 'signup' ? '1rem' : '1.2rem' }}>
                <label style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: MUTED }}>Password</label>
                <div style={{ position: 'relative', marginTop: 6 }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder={mode === 'signup' ? 'Create a strong password' : 'Your password'}
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    style={{ width: '100%', background: '#181818', border: `1px solid ${BORDER}`, borderRadius: 3, padding: '11px 40px 11px 14px', fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 300, color: CREAM, outline: 'none' }}
                  />
                  <button type="button" onClick={() => setShowPassword(s => !s)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: MUTED, cursor: 'pointer', fontSize: 12, padding: 0 }}>
                    {showPassword ? '🙈' : '👁'}
                  </button>
                </div>

                {/* Password strength — only show on signup */}
                {mode === 'signup' && form.password.length > 0 && (
                  <div style={{ marginTop: 10 }}>
                    {/* Strength bar */}
                    <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
                      {[1,2,3,4].map(i => (
                        <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: passwordStrength >= i ? (passwordStrength <= 1 ? '#E05252' : passwordStrength <= 2 ? '#E8A020' : passwordStrength <= 3 ? '#D4A853' : '#5DBE8A') : '#2A2A2A', transition: 'background 0.3s ease' }} />
                      ))}
                    </div>
                    {/* Checklist */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                      {passwordChecks.map((c, i) => (
                        <div key={i} style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                          <div style={{ width: 14, height: 14, borderRadius: '50%', background: c.pass ? '#5DBE8A' : '#2A2A2A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.25s ease' }}>
                            {c.pass && <span style={{ color: '#0A0A0A', fontSize: 8, fontWeight: 600 }}>✓</span>}
                          </div>
                          <span style={{ fontSize: 9, color: c.pass ? '#5DBE8A' : '#555', transition: 'color 0.25s ease' }}>{c.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {mode === 'signup' && (
                <div style={{ marginBottom: '1.2rem' }}>
                  <label style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: MUTED, marginBottom: 8, display: 'block' }}>Plan</label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {plans.map(p => (
                      <button key={p.id} type="button" onClick={() => setSelectedPlan(p.id)} style={{
                        flex: 1, padding: '8px 4px', fontSize: 8, fontWeight: 600, letterSpacing: '0.1em',
                        textTransform: 'uppercase', borderRadius: 4, cursor: 'pointer',
                        border: `1px solid ${selectedPlan === p.id ? GOLD : '#2A2A2A'}`,
                        background: selectedPlan === p.id ? `${GOLD}18` : 'transparent',
                        color: selectedPlan === p.id ? GOLD : '#555',
                        fontFamily: "'Inter', sans-serif"
                      }}>{p.name}</button>
                    ))}
                  </div>
                </div>
              )}

              <button type="submit" disabled={loading} style={{ width: '100%', background: GOLD, color: OBS, border: 'none', padding: '13px', fontSize: 10, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', borderRadius: 2, cursor: 'pointer', fontFamily: "'Inter', sans-serif", opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Please wait...' : mode === 'signup' ? 'Create account' : 'Sign in'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button onClick={() => { setMode(mode === 'signup' ? 'login' : 'signup'); setError(''); setSuccess('') }}
                style={{ background: 'transparent', border: 'none', color: MUTED, fontSize: 10, cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>
                {mode === 'signup' ? 'Already have an account? Sign in' : 'No account? Create one free'}
              </button>
              {mode === 'login' && (
                <button onClick={async () => {
                  if (!form.email) { setError('Enter your email first'); return }
                  setLoading(true)
                  const { error: resetErr } = await supabase.auth.resetPasswordForEmail(form.email, {
                    redirectTo: `${window.location.origin}/reset-password`
                  })
                  setLoading(false)
                  if (resetErr) setError(resetErr.message)
                  else setSuccess('Password reset link sent! Check your email.')
                }} style={{ background: 'transparent', border: 'none', color: '#666', fontSize: 9, cursor: 'pointer', fontFamily: "'Inter', sans-serif", letterSpacing: '0.05em' }}>
                  Forgot your password?
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
