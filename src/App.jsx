import { useState, useEffect } from 'react'
import { supabase, getProfile } from './lib/supabase'
import Landing from './pages/Landing'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'

export default function App() {
  const [screen, setScreen] = useState('loading')
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        loadProfile(session.user.id)
      } else {
        setScreen('landing')
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
        loadProfile(session.user.id)
      } else {
        setUser(null)
        setProfile(null)
        setScreen('landing')
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function loadProfile(userId) {
    const p = await getProfile(userId)
    if (p && p.handle) {
      setProfile(p)
      setScreen('dashboard')
    } else {
      setScreen('onboarding')
    }
  }

  const handleOnboardingComplete = (profileData) => {
    setProfile(profileData)
    setScreen('dashboard')
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  if (screen === 'loading') return (
    <div style={{ background: '#0A0A0A', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: '#C9A84C', letterSpacing: '0.3em', textTransform: 'uppercase', opacity: 0.7 }}>Calm AI</div>
    </div>
  )

  if (screen === 'landing') return <Landing />
  if (screen === 'onboarding') return <Onboarding user={user} onComplete={handleOnboardingComplete} />
  if (screen === 'dashboard') return <Dashboard user={user} profile={profile} onLogout={handleLogout} />
  return null
}
