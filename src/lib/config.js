export const GOLD = '#D4A853'
export const OBS = '#141414'
export const CREAM = '#F5F0E8'
export const MUTED = '#8A8A80'
export const BORDER = '#2A2A2A'
export const SURFACE = '#1E1E1E'

export const PLANS = {
  starter: {
    name: 'Starter',
    priceINR: 299,
    priceUSD: 9,
    limits: { ideas: 10, scripts: 3, chat: 0, captions: 5, trends: false, viralScore: false, aiChat: false }
  },
  growth: {
    name: 'Growth',
    priceINR: 699,
    priceUSD: 19,
    limits: { ideas: 40, scripts: 10, chat: 30, captions: 30, trends: true, viralScore: true, aiChat: true }
  },
  pro: {
    name: 'Pro',
    priceINR: 1499,
    priceUSD: 39,
    limits: { ideas: -1, scripts: -1, chat: -1, captions: -1, trends: true, viralScore: true, aiChat: true }
  }
}

export const NICHES = [
  'Finance', 'Fitness', 'Food', 'Fashion', 'Travel',
  'Education', 'Comedy', 'Beauty', 'Business', 'Lifestyle',
  'Gaming', 'Music', 'Technology', 'Sports', 'Motivation',
  'Health', 'Photography', 'Cooking', 'Art', 'Other'
]

export const PLATFORMS = [
  { id: 'youtube', label: 'YouTube' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'shorts', label: 'YouTube Shorts' },
  { id: 'x', label: 'X / Twitter' },
  { id: 'podcast', label: 'Podcast' }
]

export const GOALS = [
  'Grow my followers fast',
  'Get my first brand deal',
  'Post consistently',
  'Build a personal brand',
  'Monetise my content',
  'Go viral'
]

export const TONES = [
  'Casual and friendly',
  'Educational and informative',
  'Bold and provocative',
  'Funny and entertaining',
  'Inspirational',
  'Expert and authoritative'
]

export const REGIONS = [
  { id: 'india', label: 'India', flag: '🇮🇳' },
  { id: 'global', label: 'Global', flag: '🌍' }
]
