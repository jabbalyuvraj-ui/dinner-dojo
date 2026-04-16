import { useState, useMemo } from 'react'
import dishes from '../data/dishes'

// ── Fuzzy ingredient match ────────────────────────────────────────────────
function ingMatch(dishIng, userIng) {
  const d = dishIng.toLowerCase().trim()
  const u = userIng.toLowerCase().trim()
  if (d.includes(u) || u.includes(d)) return true
  const words = u.split(/\s+/).filter(w => w.length > 2)
  return words.some(w => d.includes(w))
}

function countMatches(dishIngredients, userIngredients) {
  return dishIngredients.filter(di =>
    userIngredients.some(ui => ingMatch(di, ui))
  ).length
}

function scoreDish(dish, userIngredients, primaryCuisines, activeFlavors,
                   ingScores = {}, flScores = {}, cuScores = {}) {
  let score = 0
  const matches = countMatches(dish.ingredients, userIngredients)
  score += matches * 10
  if (dish.ingredients.length > 0)
    score += (matches / dish.ingredients.length) * 5
  const cuisineMatch = primaryCuisines.some(c => {
    const cl = c.toLowerCase(), dl = dish.cuisine.toLowerCase()
    return dl.includes(cl) || cl.includes(dl)
  })
  if (cuisineMatch) score += 4
  if (activeFlavors.length > 0)
    score += dish.flavors.filter(f => activeFlavors.includes(f)).length * 2
  dish.ingredients.forEach(i => { score += (ingScores[i] || 0) * 2 })
  score += (cuScores[dish.cuisine] || 0) * 3
  dish.flavors.forEach(f => { score += (flScores[f] || 0) * 1.5 })
  if (dish.difficulty === 'easy') score += 1
  return score
}

const SIMILAR = {
  'Indian':         ['Middle Eastern','Thai','Asian'],
  'Thai':           ['Asian','Japanese','Korean','Chinese'],
  'Japanese':       ['Asian','Korean','Chinese'],
  'Korean':         ['Asian','Japanese','Chinese'],
  'Chinese':        ['Asian','Japanese','Korean','Thai'],
  'Asian':          ['Thai','Japanese','Korean','Chinese'],
  'Mexican':        ['American'],
  'Italian':        ['Mediterranean'],
  'Mediterranean':  ['Italian','Middle Eastern'],
  'Middle Eastern': ['Mediterranean','Indian'],
  'American':       ['Mexican'],
}

export default function Preferences({ userData, likedDishes, setLikedDishes, bannedDishes, onComplete, onBack }) {
  const [round,     setRound]     = useState(0)
  const [declined,  setDeclined]  = useState([])
  const [ingScores, setIngScores] = useState({})
  const [flScores,  setFlScores]  = useState({})
  const [cuScores,  setCuScores]  = useState({})

  const userIngredients = userData.ingredients || []
  const primaryCuisines = userData.cuisines    || []
  const activeFlavors   = Object.entries(userData.flavors || {})
    .filter(([, v]) => v).map(([k]) => k)
  const hasIngredients  = userIngredients.length >= 1

  // ── Build pool once ──────────────────────────────────────────────────────
  const { pool, totalRounds } = useMemo(() => {
    const now       = Date.now()
    const banned    = bannedDishes || {}
    const activeBan = new Set(Object.entries(banned).filter(([, e]) => e > now).map(([n]) => n))
    const eligible  = dishes.filter(d => !activeBan.has(d.name))

    const scored = eligible.map(d => ({
      ...d,
      _matches: countMatches(d.ingredients, userIngredients),
      _score:   scoreDish(d, userIngredients, primaryCuisines, activeFlavors),
    }))

    let finalPool

    if (hasIngredients) {
      const tier1 = scored.filter(d => d._matches >= 2)
      const tier2 = scored.filter(d => d._matches === 1)
      const tier3 = scored.filter(d =>
        d._matches === 0 &&
        primaryCuisines.some(c => {
          const cl = c.toLowerCase(), dl = d.cuisine.toLowerCase()
          return dl.includes(cl) || cl.includes(dl)
        })
      )
      finalPool = tier1.length >= 8 ? tier1
                : tier1.length >= 4 ? [...tier1, ...tier2]
                : tier2.length > 0  ? [...tier1, ...tier2]
                : [...tier1, ...tier2, ...tier3]
    } else {
      finalPool = scored.filter(d =>
        primaryCuisines.some(c => {
          const cl = c.toLowerCase(), dl = d.cuisine.toLowerCase()
          return dl.includes(cl) || cl.includes(dl)
        })
      )
      if (finalPool.length < 8) {
        const sim = new Set()
        primaryCuisines.forEach(c => (SIMILAR[c] || []).forEach(s => sim.add(s)))
        const poolNames = new Set(finalPool.map(d => d.name))
        const extra = scored.filter(d =>
          !poolNames.has(d.name) &&
          [...sim].some(sc => d.cuisine.toLowerCase().includes(sc.toLowerCase()))
        )
        finalPool = [...finalPool, ...extra]
      }
    }

    finalPool.sort((a, b) => b._score - a._score)
    const rounds = Math.min(12, Math.max(4, finalPool.length))
    return { pool: finalPool, totalRounds: rounds }
  }, []) // build once — userData is stable when Preferences mounts

  // ── Pick current dish ────────────────────────────────────────────────────
  const currentDish = useMemo(() => {
    const shown = new Set([
      ...likedDishes.map(d => d.name),
      ...declined.map(d => d.name),
    ])
    const remaining = pool.filter(d => !shown.has(d.name))
    if (remaining.length === 0) return null
    if (round < 2) return remaining[0]
    const rescored = remaining.map(d => ({
      ...d,
      _rs: scoreDish(d, userIngredients, primaryCuisines, activeFlavors, ingScores, flScores, cuScores)
           - declined.filter(x => x.cuisine === d.cuisine).length * 3,
    }))
    rescored.sort((a, b) => b._rs - a._rs)
    return rescored[0]
  }, [round, pool, likedDishes, declined, ingScores, flScores, cuScores])

  // ── Generate final recommendation ────────────────────────────────────────
  const generateRec = (finalLiked, finalDeclined) => {
    const iS = {}, fS = {}, cS = {}
    finalLiked.forEach(d => {
      d.ingredients.forEach(i => { iS[i] = (iS[i] || 0) + 2 })
      d.flavors.forEach(f => { fS[f] = (fS[f] || 0) + 2 })
      cS[d.cuisine] = (cS[d.cuisine] || 0) + 3
    })
    finalDeclined.forEach(d => {
      d.ingredients.forEach(i => { iS[i] = (iS[i] || 0) - 2 })
      d.flavors.forEach(f => { fS[f] = (fS[f] || 0) - 1 })
      cS[d.cuisine] = (cS[d.cuisine] || 0) - 2
    })

    const now       = Date.now()
    const banned    = bannedDishes || {}
    const activeBan = new Set(Object.entries(banned).filter(([, e]) => e > now).map(([n]) => n))
    const decNames  = new Set(finalDeclined.map(d => d.name))

    let candidates = dishes.filter(d => !decNames.has(d.name) && !activeBan.has(d.name))

    if (hasIngredients) {
      const t1 = candidates.filter(d => countMatches(d.ingredients, userIngredients) >= 2)
      const t2 = candidates.filter(d => countMatches(d.ingredients, userIngredients) === 1)
      if (t1.length > 0) candidates = t1
      else if (t2.length > 0) candidates = t2
    }

    if (candidates.length === 0) return finalLiked[finalLiked.length - 1] || dishes[0]

    const shown = new Set([...finalLiked.map(d => d.name), ...decNames])
    const final = candidates.map(d => ({
      ...d,
      _f: scoreDish(d, userIngredients, primaryCuisines, activeFlavors, iS, fS, cS)
          + (!shown.has(d.name) ? 2 : 0),
    }))
    final.sort((a, b) => b._f - a._f)
    return final[0]
  }

  // ── Vote — call onComplete directly with up-to-date arrays ───────────────
  const handleVote = (liked) => {
    if (!currentDish) return

    // Build the definitive liked/declined lists RIGHT NOW before any setState
    const newLiked    = liked ? [...likedDishes, currentDish] : likedDishes
    const newDeclined = liked ? declined : [...declined, currentDish]

    // Update learning scores
    if (liked) {
      setIngScores(p => { const n = {...p}; currentDish.ingredients.forEach(i => { n[i] = (n[i]||0)+1 }); return n })
      setFlScores(p  => { const n = {...p}; currentDish.flavors.forEach(f    => { n[f] = (n[f]||0)+1 }); return n })
      setCuScores(p  => ({ ...p, [currentDish.cuisine]: (p[currentDish.cuisine]||0)+1 }))
      setLikedDishes(newLiked)
    } else {
      setIngScores(p => { const n = {...p}; currentDish.ingredients.forEach(i => { n[i] = (n[i]||0)-1 }); return n })
      setFlScores(p  => { const n = {...p}; currentDish.flavors.forEach(f    => { n[f] = (n[f]||0)-1 }); return n })
      setCuScores(p  => ({ ...p, [currentDish.cuisine]: (p[currentDish.cuisine]||0)-1 }))
      setDeclined(newDeclined)
    }

    const effectiveTotal = Math.min(totalRounds, pool.length)
    const nextRound      = round + 1

    // Last round — generate recommendation with the COMPLETE lists right now
    if (nextRound >= effectiveTotal) {
      const rec = generateRec(newLiked, newDeclined)
      onComplete(rec)   // this calls navigate('result') in App.jsx
      return
    }

    setRound(nextRound)
  }

  // ── Render ────────────────────────────────────────────────────────────────
  if (!currentDish) {
    // Pool ran out before rounds — complete immediately
    const rec = generateRec(likedDishes, declined)
    onComplete(rec)
    return null
  }

  const effectiveTotal = Math.min(totalRounds, pool.length)
  const progress       = ((round + 1) / effectiveTotal) * 100

  const matchedIngs = currentDish.ingredients.filter(di =>
    userIngredients.some(ui => ingMatch(di, ui))
  )
  const missingIngs = currentDish.ingredients.filter(di =>
    !userIngredients.some(ui => ingMatch(di, ui))
  )

  return (
    <div className="screen" style={{ justifyContent: 'center' }}>
      <button className="back-btn" onClick={onBack}>← Back</button>

      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <span style={{ fontWeight: 700, color: '#636E72', fontSize: '0.9rem' }}>
          Round {round + 1} of {effectiveTotal}
        </span>
      </div>

      <div className="progress-bar">
        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="dish-card">
        <div className="dish-emoji">{currentDish.emoji}</div>
        <h3>{currentDish.name}</h3>
        <div className="dish-tags">
          <span className="dish-tag">{currentDish.cuisine}</span>
          <span className="dish-tag">⏱ {currentDish.cookTime}</span>
          <span className="dish-tag">{currentDish.difficulty}</span>
          {currentDish.flavors.map(f => (
            <span className="dish-tag" key={f}>{f}</span>
          ))}
        </div>

        {userIngredients.length > 0 && (
          <div style={{ marginTop: 12, textAlign: 'left' }}>
            {matchedIngs.length > 0 && (
              <div style={{
                padding: '8px 12px', background: 'rgba(0,184,148,0.12)',
                borderRadius: 10, marginBottom: 6, fontSize: '0.75rem',
              }}>
                <span style={{ color: '#00B894', fontWeight: 800 }}>
                  ✓ You have ({matchedIngs.length}):
                </span>{' '}
                <span style={{ color: '#2D3436', fontWeight: 600 }}>
                  {matchedIngs.join(', ')}
                </span>
              </div>
            )}
            {missingIngs.length > 0 && (
              <div style={{
                padding: '8px 12px', background: 'rgba(116,185,255,0.12)',
                borderRadius: 10, fontSize: '0.75rem',
              }}>
                <span style={{ color: '#74B9FF', fontWeight: 800 }}>
                  🛒 Need to buy ({missingIngs.length}):
                </span>{' '}
                <span style={{ color: '#636E72', fontWeight: 600 }}>
                  {missingIngs.join(', ')}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <p style={{ textAlign: 'center', color: '#636E72', fontWeight: 600, fontSize: '0.9rem' }}>
        Would you eat this tonight?
      </p>

      <div className="vote-buttons">
        <button className="vote-btn dislike" onClick={() => handleVote(false)}>✕</button>
        <button className="vote-btn like"    onClick={() => handleVote(true)}>✓</button>
      </div>

      {round >= 3 && (
        <p style={{ textAlign: 'center', marginTop: 14, fontSize: '0.8rem', color: '#B2BEC3' }}>
          ❤️ {likedDishes.length} liked · ✕ {declined.length} passed
        </p>
      )}
    </div>
  )
}
