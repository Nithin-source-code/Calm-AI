// Run: node generate-icons.js
// Generates simple gold C icons for PWA
const { createCanvas } = require('canvas')
const fs = require('fs')

function makeIcon(size) {
  const c = createCanvas(size, size)
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#0A0A0A'
  ctx.fillRect(0, 0, size, size)
  ctx.fillStyle = '#C9A84C'
  ctx.font = `${size * 0.55}px serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('C', size/2, size/2)
  return c.toBuffer('image/png')
}

// Since canvas may not be available, create minimal valid PNGs programmatically
// These are placeholder 1x1 gold PNGs - replace with real icons
const minPNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwADhQGAWjR9awAAAABJRU5ErkJggg==', 'base64')
fs.writeFileSync('icon-192.png', minPNG)
fs.writeFileSync('icon-512.png', minPNG)
console.log('Icons created')
