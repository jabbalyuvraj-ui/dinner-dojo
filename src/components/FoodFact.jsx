import { useState, useEffect } from 'react'
import FOOD_FACTS from '../data/foodFacts'

const SEEN_KEY = 'dinnerDojo_seenFacts'

function getNextFact() {
  try {
    const seen = JSON.parse(localStorage.getItem(SEEN_KEY) || '[]')
    // Filter unseen facts
    const unseen = FOOD_FACTS.filter((_, i) => !seen.includes(i))
    if (unseen.length === 0) {
      // All seen — reset
      localStorage.setItem(SEEN_KEY, '[]')
      const i = Math.floor(Math.random() * FOOD_FACTS.length)
      localStorage.setItem(SEEN_KEY, JSON.stringify([i]))
      return { fact: FOOD_FACTS[i], index: i }
    }
    // Pick a random unseen fact
    const randomUnseen = unseen[Math.floor(Math.random() * unseen.length)]
    const index = FOOD_FACTS.indexOf(randomUnseen)
    const newSeen = [...seen, index]
    localStorage.setItem(SEEN_KEY, JSON.stringify(newSeen))
    return { fact: randomUnseen, index }
  } catch {
    return { fact: FOOD_FACTS[0], index: 0 }
  }
}

const TYPE_LABEL = {
  fact: '💡 Did you know?',
  joke: '😄 Food Joke',
  riddle: '🤔 Food Riddle',
}

const TYPE_COLOR = {
  fact: { bg: 'rgba(116,185,255,0.15)', border: 'rgba(116,185,255,0.4)', badge: '#74B9FF' },
  joke: { bg: 'rgba(253,203,110,0.15)', border: 'rgba(253,203,110,0.5)', badge: '#FDCB6E' },
  riddle: { bg: 'rgba(162,155,254,0.2)', border: 'rgba(162,155,254,0.5)', badge: '#A29BFE' },
}

function FoodFact() {
  const [current, setCurrent] = useState(null)
  const [flipping, setFlipping] = useState(false)

  useEffect(() => {
    setCurrent(getNextFact())
  }, [])

  const nextFact = () => {
    setFlipping(true)
    setTimeout(() => {
      setCurrent(getNextFact())
      setFlipping(false)
    }, 300)
  }

  if (!current) return null

  const { fact } = current
  const colors = TYPE_COLOR[fact.type] || TYPE_COLOR.fact

  return (
    <div style={{
      position: 'fixed', right: 16, top: '50%', transform: 'translateY(-50%)',
      width: 200, zIndex: 500,
    }}>
      <div style={{
        background: 'white',
        border: `3px solid ${colors.badge}`,
        borderRadius: 16,
        padding: '14px 14px 12px',
        boxShadow: '0 6px 24px rgba(0,0,0,0.18)',
        transition: 'opacity 0.3s, transform 0.3s',
        opacity: flipping ? 0 : 1,
        transform: flipping ? 'scale(0.96)' : 'scale(1)',
        fontFamily: 'Nunito, sans-serif',
      }}>
        {/* Type badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          background: colors.badge, color: 'white',
          borderRadius: 20, padding: '3px 10px', fontSize: '0.65rem',
          fontWeight: 800, marginBottom: 10, letterSpacing: '0.03em',
        }}>
          {TYPE_LABEL[fact.type]}
        </div>

        {/* Emoji */}
        <div style={{ fontSize: '1.8rem', marginBottom: 8, textAlign: 'center' }}>
          {fact.emoji}
        </div>

        {/* Text — dark, bold, readable */}
        <p style={{
          margin: 0, fontSize: '0.78rem', lineHeight: 1.6,
          color: '#2D3436', fontWeight: 700, textAlign: 'center',
        }}>
          {fact.text}
        </p>

        {/* Next button */}
        <button
          onClick={nextFact}
          style={{
            width: '100%', marginTop: 12, padding: '7px',
            background: colors.badge, border: 'none',
            borderRadius: 8, color: 'white', cursor: 'pointer',
            fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: '0.72rem',
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          Next {fact.type === 'riddle' ? 'riddle' : fact.type === 'joke' ? 'joke' : 'fact'} →
        </button>
      </div>
    </div>
  )
}

export default FoodFact
