import { useState, useRef } from 'react'
import PantryScanner from './PantryScanner'

const CUISINES = [
  { id: 'Italian',        emoji: '🇮🇹' },
  { id: 'Asian',          emoji: '🥡' },
  { id: 'Mexican',        emoji: '🇲🇽' },
  { id: 'Indian',         emoji: '🇮🇳' },
  { id: 'Middle Eastern', emoji: '🧆' },
  { id: 'American',       emoji: '🇺🇸' },
  { id: 'Mediterranean',  emoji: '🫒' },
  { id: 'Japanese',       emoji: '🇯🇵' },
  { id: 'Thai',           emoji: '🇹🇭' },
  { id: 'Korean',         emoji: '🇰🇷' },
  { id: 'Chinese',        emoji: '🇨🇳' },
]

const DIETARY = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free']

const FLAVORS = [
  { key: 'sweet',   emoji: '🍯', label: 'Sweet'   },
  { key: 'salty',   emoji: '🧂', label: 'Salty'   },
  { key: 'sour',    emoji: '🍋', label: 'Sour'    },
  { key: 'spicy',   emoji: '🌶️', label: 'Spicy'   },
  { key: 'savoury', emoji: '🥩', label: 'Savoury' },
  { key: 'bitter',  emoji: '🫒', label: 'Bitter'  },
]

const PREV_KEY = 'dinnerDojo_prevUserData'

// ── Read saved data (called on demand, never on mount) ───────────────────────
function readSaved() {
  try {
    const raw = localStorage.getItem(PREV_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

// ── Write to localStorage only when there's real data ────────────────────────
function persistData(data) {
  const hasData = data.ingredients?.length > 0 || data.cuisines?.length > 0
  if (!hasData) return  // never overwrite good data with empty defaults
  try { localStorage.setItem(PREV_KEY, JSON.stringify(data)) } catch {}
}

export default function Onboarding({ userData, setUserData, onNext }) {
  const [ingredientInput, setIngredientInput] = useState('')
  const [otherCuisine, setOtherCuisine]       = useState('')
  const [isRecording, setIsRecording]         = useState(false)
  const [showScanner, setShowScanner]         = useState(false)
  const [restoreFlash, setRestoreFlash]       = useState(false)
  const recognitionRef = useRef(null)

  // ── Wrapper: update userData AND save to localStorage ────────────────────
  const update = (updater) => {
    setUserData(cur => {
      const next = typeof updater === 'function' ? updater(cur) : updater
      persistData(next)
      return next
    })
  }

  // ── SELECT PREVIOUS — reads fresh from localStorage each time ────────────
  const selectPrevious = (section) => {
    const saved = readSaved()
    if (!saved) {
      alert('No previous session found yet. Fill in your preferences and they\'ll be saved automatically!')
      return
    }

    setRestoreFlash(true)
    setTimeout(() => setRestoreFlash(false), 1200)

    switch (section) {
      case 'all':
        update(() => ({
          ingredients: saved.ingredients || [],
          cuisines:    saved.cuisines    || [],
          flavors:     saved.flavors     || { sweet: false, salty: false, sour: false, spicy: false, savoury: false, bitter: false },
          people:      saved.people      || 2,
          dietary:     saved.dietary     || [],
        }))
        break
      case 'ingredients':
        update(cur => ({ ...cur, ingredients: saved.ingredients || [] }))
        break
      case 'cuisines':
        update(cur => ({ ...cur, cuisines: saved.cuisines || [] }))
        break
      case 'flavors':
        update(cur => ({ ...cur, flavors: saved.flavors || cur.flavors }))
        break
      case 'people':
        update(cur => ({ ...cur, people: saved.people || cur.people }))
        break
      case 'dietary':
        update(cur => ({ ...cur, dietary: saved.dietary || [] }))
        break
    }
  }

  // ── Ingredient helpers ────────────────────────────────────────────────────
  const addIngredient = (value) => {
    const val = (value || ingredientInput).trim().toLowerCase()
    if (val && !userData.ingredients.includes(val))
      update(cur => ({ ...cur, ingredients: [...cur.ingredients, val] }))
    setIngredientInput('')
  }

  const removeIngredient = (ing) =>
    update(cur => ({ ...cur, ingredients: cur.ingredients.filter(i => i !== ing) }))

  const handleScanResults = (scanned) => {
    update(cur => {
      const existing = new Set(cur.ingredients)
      const newIngs  = scanned.filter(i => !existing.has(i.toLowerCase()))
      return { ...cur, ingredients: [...cur.ingredients, ...newIngs.map(i => i.toLowerCase())] }
    })
  }

  const toggleCuisine = (c) => update(cur => ({
    ...cur,
    cuisines: cur.cuisines.includes(c) ? cur.cuisines.filter(x => x !== c) : [...cur.cuisines, c],
  }))

  const addOtherCuisine = () => {
    const val = otherCuisine.trim()
    if (val && !userData.cuisines.includes(val))
      update(cur => ({ ...cur, cuisines: [...cur.cuisines, val] }))
    setOtherCuisine('')
  }

  const toggleFlavor  = (key) => update(cur => ({ ...cur, flavors: { ...cur.flavors, [key]: !cur.flavors[key] } }))
  const toggleDietary = (d)   => update(cur => ({
    ...cur,
    dietary: cur.dietary.includes(d) ? cur.dietary.filter(x => x !== d) : [...cur.dietary, d],
  }))

  // ── Voice ─────────────────────────────────────────────────────────────────
  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { alert('Speech recognition not supported. Try Chrome or Edge.'); return }
    if (isRecording) { recognitionRef.current?.stop(); setIsRecording(false); return }
    const rec = new SR()
    recognitionRef.current = rec
    rec.continuous = false; rec.interimResults = false; rec.lang = 'en-AU'
    rec.onstart  = () => setIsRecording(true)
    rec.onresult = (e) => {
      const text = e.results[0][0].transcript.toLowerCase().trim()
      text.split(/,|\band\b/).map(s => s.trim()).filter(Boolean).forEach(item => {
        if (item && !userData.ingredients.includes(item))
          update(cur => ({ ...cur, ingredients: [...cur.ingredients, item] }))
      })
    }
    rec.onerror = () => setIsRecording(false)
    rec.onend   = () => setIsRecording(false)
    rec.start()
  }

  const canProceed    = userData.cuisines.length > 0
  const customCuisines = userData.cuisines.filter(c => !CUISINES.map(x => x.id).includes(c))

  // ── Small per-section restore button ─────────────────────────────────────
  const SectionRestoreBtn = ({ section, label }) => (
    <button
      onClick={() => selectPrevious(section)}
      style={{
        padding: '4px 10px',
        background: 'rgba(162,155,254,0.18)',
        border: '1.5px solid #A29BFE',
        borderRadius: 20,
        color: '#A29BFE',
        fontWeight: 800,
        fontSize: '0.72rem',
        cursor: 'pointer',
        letterSpacing: '0.03em',
        whiteSpace: 'nowrap',
      }}
    >
      🔄 prev {label}
    </button>
  )

  return (
    <div className="screen" style={{ overflowY: 'auto' }}>
      <h2>Tell us about yourself 🍽️</h2>

      {/* ── BIG "RESTORE EVERYTHING" BUTTON at top ── */}
      <button
        onClick={() => selectPrevious('all')}
        style={{
          width: '100%',
          padding: '16px',
          marginBottom: 20,
          background: 'linear-gradient(135deg, #6C5CE7, #A29BFE)',
          border: 'none',
          borderRadius: 14,
          color: 'white',
          fontFamily: 'Nunito, sans-serif',
          fontWeight: 900,
          fontSize: '1.05rem',
          cursor: 'pointer',
          letterSpacing: '0.05em',
          boxShadow: restoreFlash
            ? '0 0 0 4px #A29BFE, 0 4px 20px rgba(108,92,231,0.5)'
            : '0 4px 16px rgba(108,92,231,0.4)',
          transition: 'box-shadow 0.3s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
        }}
      >
        🔄 SELECT PREVIOUS SESSION
      </button>

      {/* ── INGREDIENTS ─────────────────────────────────────────────── */}
      <div className="form-group">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <label style={{ margin: 0 }}>What ingredients do you have?</label>
          <SectionRestoreBtn section="ingredients" label="ingredients" />
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <div className="tag-input-wrapper" style={{ flex: 1 }}>
            {userData.ingredients.map(ing => (
              <span key={ing} className="tag">
                {ing}
                <button onClick={() => removeIngredient(ing)}>×</button>
              </span>
            ))}
            <input
              type="text"
              placeholder="Type & press Enter"
              value={ingredientInput}
              onChange={e => setIngredientInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addIngredient() } }}
            />
          </div>
          <button
            className={`mic-btn ${isRecording ? 'recording' : ''}`}
            onClick={startListening}
            title={isRecording ? 'Stop recording' : 'Speak ingredients'}
          >🎤</button>
        </div>
        {isRecording && (
          <p style={{ color: '#FF6B6B', fontSize: '0.8rem', marginTop: 4, fontWeight: 600 }}>
            🔴 Listening... say your ingredients
          </p>
        )}
        <button
          onClick={() => setShowScanner(true)}
          style={{
            width: '100%', marginTop: 10, padding: '12px',
            background: 'linear-gradient(135deg, #00B894, #00A381)',
            color: 'white', border: 'none', borderRadius: 12,
            fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.95rem',
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 8,
            boxShadow: '0 2px 8px rgba(0,184,148,0.3)',
          }}
        >
          📷 SCAN your pantry or fridge
        </button>
      </div>

      {/* ── CUISINES ──────────────────────────────────────────────── */}
      <div className="form-group">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <label style={{ margin: 0 }}>What cuisines do you enjoy?</label>
          <SectionRestoreBtn section="cuisines" label="cuisines" />
        </div>
        <div className="checkbox-grid">
          {CUISINES.map(c => (
            <div
              key={c.id}
              className={`checkbox-item ${userData.cuisines.includes(c.id) ? 'selected' : ''}`}
              onClick={() => toggleCuisine(c.id)}
            >
              <input type="checkbox" checked={userData.cuisines.includes(c.id)} readOnly />
              {c.emoji} {c.id}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <input
            className="other-input"
            type="text"
            placeholder="Other cuisine (type and press Enter)"
            value={otherCuisine}
            onChange={e => setOtherCuisine(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addOtherCuisine() } }}
            style={{ flex: 1 }}
          />
          <button
            className="btn btn-primary"
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            onClick={addOtherCuisine}
            disabled={!otherCuisine.trim()}
          >Add</button>
        </div>
        {customCuisines.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
            {customCuisines.map(c => (
              <span key={c} className="tag">🍽️ {c}<button onClick={() => toggleCuisine(c)}>×</button></span>
            ))}
          </div>
        )}
      </div>

      {/* ── FLAVOURS ──────────────────────────────────────────────── */}
      <div className="form-group">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <label style={{ margin: 0 }}>Flavour preferences</label>
          <SectionRestoreBtn section="flavors" label="flavours" />
        </div>
        {FLAVORS.map(flavor => (
          <div className="toggle-row" key={flavor.key}>
            <span style={{ fontWeight: 600 }}>{flavor.emoji} {flavor.label}</span>
            <div
              className={`toggle-switch ${userData.flavors[flavor.key] ? 'active' : ''}`}
              onClick={() => toggleFlavor(flavor.key)}
            />
          </div>
        ))}
      </div>

      {/* ── PEOPLE ────────────────────────────────────────────────── */}
      <div className="form-group">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <label style={{ margin: 0 }}>How many people eating?</label>
          <SectionRestoreBtn section="people" label="people" />
        </div>
        <div className="number-input">
          <button onClick={() => update(cur => ({ ...cur, people: Math.max(1, cur.people - 1) }))}>−</button>
          <span>{userData.people}</span>
          <button onClick={() => update(cur => ({ ...cur, people: Math.min(12, cur.people + 1) }))}>+</button>
        </div>
      </div>

      {/* ── DIETARY ───────────────────────────────────────────────── */}
      <div className="form-group">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <label style={{ margin: 0 }}>Any dietary restrictions?</label>
          <SectionRestoreBtn section="dietary" label="dietary" />
        </div>
        <div className="checkbox-grid">
          {DIETARY.map(d => (
            <div
              key={d}
              className={`checkbox-item ${userData.dietary.includes(d) ? 'selected' : ''}`}
              onClick={() => toggleDietary(d)}
            >
              <input type="checkbox" checked={userData.dietary.includes(d)} readOnly />
              {d}
            </div>
          ))}
        </div>
      </div>

      {/* ── NEXT ──────────────────────────────────────────────────── */}
      <div style={{ marginTop: 'auto', paddingTop: 16 }}>
        <button
          className="btn btn-primary btn-block btn-large"
          onClick={onNext}
          disabled={!canProceed}
          style={{ opacity: canProceed ? 1 : 0.5 }}
        >
          Next →
        </button>
        {!canProceed && (
          <p style={{ textAlign: 'center', color: '#B2BEC3', fontSize: '0.8rem', marginTop: 8 }}>
            Select at least one cuisine to continue
          </p>
        )}
      </div>

      {showScanner && (
        <PantryScanner
          onIngredientsFound={handleScanResults}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  )
}
