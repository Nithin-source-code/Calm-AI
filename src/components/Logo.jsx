// Calm AI Logo Component
// Usage: <Logo size={40} /> or <Logo size={32} showText={false} />

export default function Logo({ size = 40, showText = true, light = false }) {
  const textColor = light ? '#1A1A1A' : '#F0EBE0'
  const goldColor = light ? '#B8882A' : '#C9A45A'
  const strokeColor = textColor

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: size * 0.3 }}>
      {/* Icon mark */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        {/* C arc — opens right */}
        <path
          d="M 62,16 A 34,34 0 1,0 62,84"
          fill="none"
          stroke={strokeColor}
          strokeWidth="9"
          strokeLinecap="round"
        />
        {/* Gold dot top */}
        <circle cx="62" cy="16" r="6.5" fill={goldColor} />
        {/* Gold dot bottom */}
        <circle cx="62" cy="84" r="6.5" fill={goldColor} />
        {/* Gold chevron < inside */}
        <polyline
          points="55,43 44,50 55,57"
          fill="none"
          stroke={goldColor}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Wordmark */}
      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <span style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: size * 0.42,
            fontWeight: 400,
            color: textColor,
            letterSpacing: size * 0.06,
            lineHeight: 1.1
          }}>CALM</span>
          <span style={{
            fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
            fontSize: size * 0.22,
            fontWeight: 400,
            color: goldColor,
            letterSpacing: size * 0.1,
            lineHeight: 1.2,
            marginTop: 1
          }}>AI</span>
        </div>
      )}
    </div>
  )
}

// Icon only — for favicon and small spaces
export function LogoIcon({ size = 32, light = false }) {
  const textColor = light ? '#1A1A1A' : '#F0EBE0'
  const goldColor = light ? '#B8882A' : '#C9A45A'
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M 62,16 A 34,34 0 1,0 62,84" fill="none" stroke={textColor} strokeWidth="9" strokeLinecap="round"/>
      <circle cx="62" cy="16" r="6.5" fill={goldColor}/>
      <circle cx="62" cy="84" r="6.5" fill={goldColor}/>
      <polyline points="55,43 44,50 55,57" fill="none" stroke={goldColor} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
