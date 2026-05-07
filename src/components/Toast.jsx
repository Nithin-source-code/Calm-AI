import { useState, useCallback, useEffect } from 'react'
import { GOLD, OBS, BORDER } from '../lib/config'

let toastFn = null

export function useToast() {
  return useCallback((msg, type = 'success') => {
    if (toastFn) toastFn(msg, type)
  }, [])
}

export function ToastProvider() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    toastFn = (msg, type) => {
      const id = Date.now()
      setToasts(prev => [...prev, { id, msg, type }])
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
    }
    return () => { toastFn = null }
  }, [])

  if (!toasts.length) return null

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 999, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          background: '#111', border: `1px solid ${t.type === 'error' ? '#E05252' : GOLD + '66'}`,
          borderRadius: 8, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10,
          fontFamily: "'Inter', sans-serif", fontSize: 11, color: t.type === 'error' ? '#E05252' : '#E8D5A3',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          animation: 'slideIn 0.2s ease'
        }}>
          <span style={{ fontSize: 12 }}>{t.type === 'error' ? '✕' : '✓'}</span>
          {t.msg}
        </div>
      ))}
      <style>{`@keyframes slideIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  )
}
