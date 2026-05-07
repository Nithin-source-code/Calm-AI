import { createContext, useContext, useState, useEffect } from 'react'
import { createElement } from 'react'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    try {
      const saved = localStorage.getItem('calm_theme')
      return saved ? saved === 'dark' : true
    } catch { return true }
  })

  useEffect(() => {
    try { localStorage.setItem('calm_theme', dark ? 'dark' : 'light') } catch {}
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
    document.body.style.background = dark ? '#141414' : '#F5F2EC'
    document.body.style.color = dark ? '#F5F0E8' : '#1A1A1A'
  }, [dark])

  return createElement(
    ThemeContext.Provider,
    { value: { dark, toggle: () => setDark(d => !d) } },
    children
  )
}

export const useTheme = () => useContext(ThemeContext)

export function useColors() {
  const ctx = useContext(ThemeContext)
  const dark = ctx ? ctx.dark : true
  return {
    BG:       dark ? '#141414' : '#F5F2EC',
    SURFACE:  dark ? '#1E1E1E' : '#FFFFFF',
    SURFACE2: dark ? '#252525' : '#F0ECE4',
    BORDER:   dark ? '#2A2A2A' : '#DDD8CE',
    CREAM:    dark ? '#F5F0E8' : '#1A1A1A',
    MUTED:    dark ? '#8A8A80' : '#6A6A60',
    GOLD:     '#D4A853',
    OBS:      dark ? '#141414' : '#F5F2EC',
    INPUT_BG: dark ? '#181818' : '#F8F5EF',
  }
}
