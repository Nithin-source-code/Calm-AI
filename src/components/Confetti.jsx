import { useEffect } from 'react'

export default function Confetti({ onDone }) {
  useEffect(() => {
    const canvas = document.getElementById('confetti-canvas')
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const pieces = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: -10 - Math.random() * 100,
      w: 6 + Math.random() * 8,
      h: 10 + Math.random() * 6,
      color: ['#C9A84C', '#F0EBE0', '#E8D5A3', '#A0885A', '#FFFFFF'][Math.floor(Math.random() * 5)],
      speed: 2 + Math.random() * 4,
      angle: Math.random() * 360,
      spin: (Math.random() - 0.5) * 4,
      drift: (Math.random() - 0.5) * 2
    }))

    let frame
    let done = false

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      let allGone = true
      pieces.forEach(p => {
        p.y += p.speed
        p.x += p.drift
        p.angle += p.spin
        if (p.y < canvas.height + 20) allGone = false
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.angle * Math.PI / 180)
        ctx.fillStyle = p.color
        ctx.globalAlpha = Math.max(0, 1 - p.y / canvas.height)
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        ctx.restore()
      })
      if (allGone && !done) { done = true; onDone?.() }
      else frame = requestAnimationFrame(draw)
    }

    frame = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <canvas id="confetti-canvas" style={{
      position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999
    }} />
  )
}
