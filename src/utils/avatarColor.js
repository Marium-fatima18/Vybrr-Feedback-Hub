const NEON = [
  { bg: 'linear-gradient(135deg, #f72585, #b5179e)', glow: 'rgba(247,37,133,0.45)' },
  { bg: 'linear-gradient(135deg, #7209b7, #4361ee)', glow: 'rgba(114,9,183,0.45)'  },
  { bg: 'linear-gradient(135deg, #4cc9f0, #4361ee)', glow: 'rgba(76,201,240,0.45)' },
  { bg: 'linear-gradient(135deg, #06d6a0, #0096c7)', glow: 'rgba(6,214,160,0.45)'  },
  { bg: 'linear-gradient(135deg, #ff6b35, #f72585)', glow: 'rgba(255,107,53,0.45)' },
  { bg: 'linear-gradient(135deg, #ffd60a, #e85d04)', glow: 'rgba(255,214,10,0.45)' },
  { bg: 'linear-gradient(135deg, #3a86ff, #8338ec)', glow: 'rgba(58,134,255,0.45)' },
  { bg: 'linear-gradient(135deg, #00f5d4, #00bbf9)', glow: 'rgba(0,245,212,0.45)'  },
]

function hash(str = '') {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = str.charCodeAt(i) + ((h << 5) - h)
  }
  return Math.abs(h)
}

export function avatarStyle(str = '') {
  const { bg, glow } = NEON[hash(str) % NEON.length]
  return { background: bg, boxShadow: `0 0 10px ${glow}` }
}
