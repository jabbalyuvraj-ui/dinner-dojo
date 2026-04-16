import { useState, useEffect } from 'react'

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
const STORAGE_KEY = 'dinnerDojo_weeklyPlan'
const BANNED_KEY  = 'dinnerDojo_bannedDishes'

function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0)
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1,2,3,4,5].map(n => (
        <span
          key={n}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
          style={{
            fontSize: '1rem', cursor: 'pointer',
            color: n <= (hover || value) ? '#FDCB6E' : '#DFE6E9',
            transition: 'color 0.1s',
          }}
        >★</span>
      ))}
    </div>
  )
}

export function useBannedDishes() {
  const [banned, setBanned] = useState(() => {
    try {
      const raw = localStorage.getItem(BANNED_KEY)
      if (!raw) return {}
      const parsed = JSON.parse(raw)
      // Remove entries older than 1 week
      const now = Date.now()
      const cleaned = {}
      Object.entries(parsed).forEach(([name, expiresAt]) => {
        if (expiresAt > now) cleaned[name] = expiresAt
      })
      return cleaned
    } catch { return {} }
  })

  const banDish = (name) => {
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000 // 1 week
    setBanned(prev => {
      const next = { ...prev, [name]: expiresAt }
      localStorage.setItem(BANNED_KEY, JSON.stringify(next))
      return next
    })
  }

  const isBanned = (name) => {
    const exp = banned[name]
    if (!exp) return false
    if (exp < Date.now()) return false
    return true
  }

  return { banned, banDish, isBanned }
}

function WeeklyPlanner({ onBanDish }) {
  const [plan, setPlan] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}
    } catch { return {} }
  })
  const [isOpen, setIsOpen] = useState(false)

  const today = new Date()
  const dayName = DAYS[today.getDay() === 0 ? 6 : today.getDay() - 1]

  const updateRating = (day, rating) => {
    const entry = plan[day]
    if (!entry) return
    const newPlan = {
      ...plan,
      [day]: { ...entry, rating }
    }
    setPlan(newPlan)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPlan))

    // If rating < 3, temporarily ban this dish for 1 week
    if (rating < 3 && entry.dish) {
      onBanDish(entry.dish)
    }
  }

  // Called from outside to log a chosen dish
  const daysWithFood = DAYS.filter(d => plan[d]?.dish)

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed', left: 12, top: '50%', transform: 'translateY(-50%)',
          background: 'rgba(255,255,255,0.92)', border: 'none',
          borderRadius: '0 12px 12px 0', padding: '14px 8px',
          cursor: 'pointer', boxShadow: '2px 0 12px rgba(0,0,0,0.15)',
          fontFamily: 'Nunito, sans-serif', fontWeight: 800,
          writingMode: 'vertical-rl', textOrientation: 'mixed',
          fontSize: '0.75rem', color: '#2D3436',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          zIndex: 500,
        }}
      >
        <span style={{ fontSize: '1.1rem' }}>📅</span>
        <span style={{ letterSpacing: '0.05em' }}>WEEK PLAN</span>
        {daysWithFood.length > 0 && (
          <span style={{
            background: '#E74C3C', color: 'white', borderRadius: '50%',
            width: 18, height: 18, fontSize: '0.65rem', fontWeight: 900,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{daysWithFood.length}</span>
        )}
      </button>
    )
  }

  return (
    <div style={{
      position: 'fixed', left: 0, top: 0, bottom: 0, width: 300,
      background: 'white', boxShadow: '4px 0 20px rgba(0,0,0,0.18)',
      display: 'flex', flexDirection: 'column', zIndex: 900,
      fontFamily: 'Nunito, sans-serif',
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #6C5CE7, #A29BFE)',
        color: 'white', padding: '16px 16px 14px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: '1rem' }}>📅 Weekly Dinner Plan</div>
          <div style={{ fontSize: '0.72rem', opacity: 0.85, marginTop: 2 }}>
            ⭐ Rate below 3 stars to remove for a week
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} style={{
          background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white',
          width: 30, height: 30, borderRadius: 8, cursor: 'pointer', fontSize: '1rem',
        }}>✕</button>
      </div>

      {/* Days */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px' }}>
        {DAYS.map(day => {
          const entry = plan[day]
          const isToday = day === dayName
          return (
            <div key={day} style={{
              marginBottom: 10,
              background: isToday ? '#FFF9F0' : '#FAFAFA',
              border: `2px solid ${isToday ? '#FDCB6E' : '#F0F0F0'}`,
              borderRadius: 12, padding: '10px 12px',
            }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: entry?.dish ? 6 : 0,
              }}>
                <span style={{
                  fontWeight: 800, fontSize: '0.82rem', color: '#2D3436',
                  display: 'flex', alignItems: 'center', gap: 5,
                }}>
                  {isToday && <span style={{ background: '#FDCB6E', borderRadius: 4, padding: '1px 5px', fontSize: '0.65rem' }}>TODAY</span>}
                  {day}
                </span>
                {entry?.dish && (
                  <StarRating value={entry.rating || 0} onChange={r => updateRating(day, r)} />
                )}
              </div>

              {entry?.dish ? (
                <div>
                  <div style={{ fontSize: '0.85rem', color: '#2D3436', fontWeight: 700 }}>
                    {entry.emoji} {entry.dish}
                  </div>
                  {entry.rating > 0 && (
                    <div style={{ fontSize: '0.7rem', marginTop: 3, color: entry.rating < 3 ? '#E17055' : '#00B894', fontWeight: 700 }}>
                      {entry.rating < 3 ? '⛔ Removed for 1 week' : entry.rating >= 4 ? '❤️ Favourite!' : '👍 Good choice'}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ fontSize: '0.75rem', color: '#B2BEC3', fontStyle: 'italic' }}>
                  No dinner planned yet
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div style={{ padding: '10px 12px', borderTop: '1px solid #F0F0F0', fontSize: '0.72rem', color: '#B2BEC3', textAlign: 'center' }}>
        Dishes you choose get added here automatically
      </div>
    </div>
  )
}

// Helper to save a chosen dish to today's plan
export function saveTodaysDish(dish) {
  try {
    const today = new Date()
    const dayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1
    const dayName = DAYS[dayIndex]
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    existing[dayName] = { dish: dish.name, emoji: dish.emoji || '🍽️', rating: 0, savedAt: Date.now() }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing))
  } catch (e) { /* ignore */ }
}

export default WeeklyPlanner
