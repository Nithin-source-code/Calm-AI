import { useState } from 'react'
import { GOLD, OBS, CREAM, MUTED, BORDER, SURFACE } from '../lib/config'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const PLATFORM_COLORS = {
  instagram: { bg: 'rgba(180,60,150,0.12)', color: '#C060B0', border: 'rgba(180,60,150,0.25)' },
  youtube:   { bg: 'rgba(200,40,40,0.1)',  color: '#E05555', border: 'rgba(200,40,40,0.2)' },
  shorts:    { bg: 'rgba(200,40,40,0.08)', color: '#CC4444', border: 'rgba(200,40,40,0.18)' },
  x:         { bg: 'rgba(80,80,80,0.12)',  color: '#888',    border: '#2A2A2A' },
  podcast:   { bg: 'rgba(80,150,200,0.1)', color: '#5A9FE0', border: 'rgba(80,150,200,0.2)' }
}
const DEFAULT_COLOR = { bg: `rgba(185,120,20,0.1)`, color: '#C9A84C', border: 'rgba(185,120,20,0.25)' }

function getWeekDates() {
  const today = new Date()
  const monday = new Date(today)
  const day = today.getDay()
  const diff = day === 0 ? -6 : 1 - day
  monday.setDate(today.getDate() + diff)
  return DAYS.map((_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

export default function CalendarTab({ savedIdeas, setSavedIdeas }) {
  const weekDates = getWeekDates()
  const [scheduled, setScheduled] = useState({}) // { 'Mon-0': ideaIndex }
  const [dragging, setDragging] = useState(null)
  const [dragOver, setDragOver] = useState(null)
  const [notes, setNotes] = useState({})

  const handleDragStart = (e, idea, source) => {
    setDragging({ idea, source })
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDrop = (e, dayKey) => {
    e.preventDefault()
    if (!dragging) return
    setScheduled(prev => {
      const next = { ...prev }
      // Remove from old slot if came from calendar
      if (dragging.source !== 'sidebar') {
        Object.keys(next).forEach(k => { if (next[k]?.title === dragging.idea.title) delete next[k] })
      }
      next[dayKey] = dragging.idea
      return next
    })
    setDragging(null)
    setDragOver(null)
  }

  const removeFromCalendar = (dayKey) => {
    setScheduled(prev => { const n = { ...prev }; delete n[dayKey]; return n })
  }

  const pc = (platform) => PLATFORM_COLORS[platform] || DEFAULT_COLOR

  const today = new Date().toDateString()

  return (
    <div style={{ padding: '2rem', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 300, marginBottom: 6 }}>
          Content <em style={{ color: GOLD }}>calendar.</em>
        </div>
        <div style={{ fontSize: 10, color: MUTED }}>Drag saved ideas onto the calendar to plan your week</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 20 }}>
        {/* Sidebar — saved ideas */}
        <div>
          <div style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: MUTED, marginBottom: 10, fontWeight: 600 }}>Saved ideas</div>
          {savedIdeas.length === 0 && (
            <div style={{ fontSize: 10, color: '#333', padding: '1rem', background: SURFACE, border: `1px dashed ${BORDER}`, borderRadius: 8, textAlign: 'center', lineHeight: 1.6 }}>
              Save ideas from the Ideas tab to schedule them here.
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {savedIdeas.map((idea, i) => {
              const c = pc(idea.platform)
              return (
                <div
                  key={i}
                  draggable
                  onDragStart={e => handleDragStart(e, idea, 'sidebar')}
                  style={{
                    background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 8,
                    padding: '10px 12px', cursor: 'grab', userSelect: 'none',
                    transition: 'border-color 0.15s'
                  }}
                >
                  <div style={{ fontSize: 8, background: c.bg, color: c.color, border: `1px solid ${c.border}`, padding: '2px 7px', borderRadius: 10, display: 'inline-block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>{idea.platform}</div>
                  <div style={{ fontSize: 10, color: CREAM, lineHeight: 1.4, fontWeight: 500 }}>{idea.title}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Calendar grid */}
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
            {weekDates.map((date, i) => {
              const dayKey = `${DAYS[i]}`
              const isToday = date.toDateString() === today
              const scheduled_idea = scheduled[dayKey]
              const isOver = dragOver === dayKey

              return (
                <div
                  key={dayKey}
                  onDragOver={e => { e.preventDefault(); setDragOver(dayKey) }}
                  onDragLeave={() => setDragOver(null)}
                  onDrop={e => handleDrop(e, dayKey)}
                  style={{
                    minHeight: 160, background: isOver ? `${GOLD}08` : SURFACE,
                    border: `1px solid ${isOver ? GOLD + '44' : isToday ? GOLD + '33' : BORDER}`,
                    borderRadius: 10, padding: '10px', transition: 'all 0.15s'
                  }}
                >
                  {/* Day header */}
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: isToday ? GOLD : MUTED, fontWeight: isToday ? 600 : 400 }}>{DAYS[i]}</div>
                    <div style={{ fontSize: 13, fontWeight: isToday ? 500 : 300, color: isToday ? GOLD : '#555', marginTop: 1 }}>{date.getDate()}</div>
                  </div>

                  {/* Scheduled idea */}
                  {scheduled_idea ? (
                    <div
                      draggable
                      onDragStart={e => handleDragStart(e, scheduled_idea, 'calendar')}
                      style={{
                        background: pc(scheduled_idea.platform).bg,
                        border: `1px solid ${pc(scheduled_idea.platform).border}`,
                        borderRadius: 6, padding: '8px 10px', cursor: 'grab', position: 'relative'
                      }}
                    >
                      <div style={{ fontSize: 8, color: pc(scheduled_idea.platform).color, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4, fontWeight: 600 }}>{scheduled_idea.platform}</div>
                      <div style={{ fontSize: 10, color: CREAM, lineHeight: 1.4, paddingRight: 14, fontWeight: 500 }}>{scheduled_idea.title}</div>
                      <button onClick={() => removeFromCalendar(dayKey)} style={{
                        position: 'absolute', top: 5, right: 7, background: 'transparent',
                        border: 'none', color: '#444', fontSize: 11, cursor: 'pointer', padding: 0, lineHeight: 1
                      }}>×</button>
                    </div>
                  ) : (
                    <div style={{ height: 60, border: `1px dashed ${isOver ? GOLD + '44' : '#1A1A1A'}`, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ fontSize: 9, color: '#2A2A2A' }}>Drop here</div>
                    </div>
                  )}

                  {/* Notes */}
                  <textarea
                    placeholder="Notes..."
                    value={notes[dayKey] || ''}
                    onChange={e => setNotes(n => ({ ...n, [dayKey]: e.target.value }))}
                    style={{
                      width: '100%', background: 'transparent', border: 'none', outline: 'none',
                      fontSize: 9, color: '#444', fontFamily: "'Inter', sans-serif",
                      fontWeight: 300, resize: 'none', marginTop: 8, lineHeight: 1.6
                    }}
                    rows={2}
                  />
                </div>
              )
            })}
          </div>

          {/* Summary */}
          <div style={{ marginTop: '1.5rem', padding: '1rem 1.4rem', background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 500, color: CREAM, marginBottom: 3 }}>{Object.keys(scheduled).length} of 7 days scheduled</div>
              <div style={{ fontSize: 9, color: MUTED }}>
                {7 - Object.keys(scheduled).length > 0
                  ? `${7 - Object.keys(scheduled).length} day${7 - Object.keys(scheduled).length > 1 ? 's' : ''} open`
                  : 'Full week planned ✓'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setScheduled({})} style={{ background: 'transparent', border: `1px solid #2A2A2A`, color: MUTED, padding: '6px 14px', fontSize: 9, borderRadius: 2, cursor: 'pointer', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: "'Inter', sans-serif" }}>Clear week</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
