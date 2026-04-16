import { useState } from 'react'

// Rough price estimates for common ingredients
const PRICE_MAP = {
  default: 3.50,
  chicken: 8.99,
  beef: 12.99,
  pork: 9.99,
  lamb: 14.99,
  salmon: 13.99,
  fish: 11.99,
  shrimp: 12.99,
  tofu: 3.99,
  rice: 4.99,
  pasta: 2.99,
  noodles: 3.49,
  bread: 3.99,
  flour: 2.99,
  cheese: 5.99,
  mozzarella: 5.49,
  parmesan: 7.99,
  cream: 3.99,
  milk: 3.49,
  butter: 4.49,
  egg: 5.99,
  eggs: 5.99,
  yogurt: 4.49,
  coconut: 3.99,
  oil: 6.99,
  tomato: 3.99,
  tomatoes: 3.99,
  onion: 1.99,
  garlic: 1.49,
  ginger: 2.49,
  lemon: 1.49,
  lime: 1.49,
  avocado: 2.49,
  pepper: 2.99,
  spinach: 3.49,
  basil: 2.99,
  herbs: 2.99,
  spices: 4.99,
  soy: 3.99,
  sugar: 2.99,
  salt: 1.99,
}

function getPrice(ingredient) {
  const lower = ingredient.toLowerCase()
  for (const [key, price] of Object.entries(PRICE_MAP)) {
    if (lower.includes(key)) return price
  }
  return PRICE_MAP.default
}

function ShoppingList({ recipeData, userIngredients, onBack }) {
  const [locating, setLocating] = useState(false)
  const [stores, setStores] = useState(null)

  if (!recipeData) return null

  // Smart fuzzy match — same logic as Preferences.jsx
  // "chicken breast" matches "chicken", "soy sauce" matches "soy"
  function userHasIngredient(recipeIng, owned) {
    const r = recipeIng.toLowerCase().trim()
    for (const u of owned) {
      const uw = u.toLowerCase().trim()
      if (r.includes(uw) || uw.includes(r)) return true
      // word-level: any meaningful word in owned matches recipe
      const words = uw.split(/\s+/).filter(w => w.length > 2)
      if (words.some(w => r.includes(w))) return true
    }
    return false
  }

  const owned = (userIngredients || []).map(i => i.toLowerCase())

  // Split recipe ingredients into already-owned vs need-to-buy
  const allRecipeIngs = recipeData.ingredients || []
  const alreadyHave   = allRecipeIngs.filter(item => userHasIngredient(item.ingredient, owned))
  const missingIngredients = allRecipeIngs.filter(item => !userHasIngredient(item.ingredient, owned))

  const itemsWithPrices = missingIngredients.map(item => ({
    ...item,
    price: getPrice(item.ingredient),
  }))

  const total = itemsWithPrices.reduce((sum, item) => sum + item.price, 0)

  const findStores = () => {
    setLocating(true)
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords
          // Simulated nearby stores
          setStores([
            { name: 'Woolworths', distance: '0.8 km', address: `Near ${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°` },
            { name: 'Coles', distance: '1.2 km', address: 'Nearby shopping centre' },
            { name: 'ALDI', distance: '1.5 km', address: 'Nearby retail area' },
            { name: 'IGA', distance: '2.1 km', address: 'Local neighbourhood' },
          ])
          setLocating(false)
        },
        () => {
          setStores([
            { name: 'Woolworths', distance: '—', address: 'Location access denied' },
            { name: 'Coles', distance: '—', address: 'Enable location for distances' },
          ])
          setLocating(false)
        }
      )
    } else {
      setStores([{ name: 'Geolocation not supported', distance: '', address: '' }])
      setLocating(false)
    }
  }

  return (
    <div className="screen" style={{ overflowY: 'auto' }}>
      <button className="back-btn" onClick={onBack}>← Back to Recipe</button>

      <h2>🛒 Shopping List</h2>
      <p style={{ color: '#636E72', fontSize: '0.9rem', marginBottom: '16px' }}>
        What you need to buy for <strong>{recipeData.name}</strong>
      </p>

      {/* Already have section */}
      {alreadyHave.length > 0 && (
        <div style={{
          background: 'rgba(0,184,148,0.08)', border: '1.5px solid rgba(0,184,148,0.25)',
          borderRadius: 14, padding: '12px 16px', marginBottom: 14,
        }}>
          <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#00B894', marginBottom: 8 }}>
            ✅ Already in your kitchen ({alreadyHave.length})
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {alreadyHave.map((item, i) => (
              <span key={i} style={{
                background: 'rgba(0,184,148,0.12)', color: '#00A381',
                borderRadius: 20, padding: '3px 10px',
                fontSize: '0.78rem', fontWeight: 700,
                textDecoration: 'line-through', opacity: 0.8,
              }}>
                {item.ingredient}
              </span>
            ))}
          </div>
        </div>
      )}

      {itemsWithPrices.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '32px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🎉</div>
          <h3>You have everything!</h3>
          <p style={{ color: '#636E72' }}>No extra shopping needed. Let's cook!</p>
        </div>
      ) : (
        <div className="card">
          <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#E17055', marginBottom: 10 }}>
            🛒 Need to buy ({itemsWithPrices.length})
          </div>
          {itemsWithPrices.map((item, i) => (
            <div className="shopping-item" key={i}>
              <div>
                <div className="shopping-item-name">{item.ingredient}</div>
                {item.measure && (
                  <div style={{ fontSize: '0.8rem', color: '#B2BEC3' }}>{item.measure}</div>
                )}
              </div>
              <div className="shopping-item-price">${item.price.toFixed(2)}</div>
            </div>
          ))}
          <div className="total-row">
            <span>Estimated Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Find Nearby Stores */}
      <div style={{ marginTop: '20px' }}>
        <button
          className="btn btn-primary btn-block"
          onClick={findStores}
          disabled={locating}
        >
          {locating ? '📍 Finding stores...' : '📍 Find Nearby Stores'}
        </button>

        {stores && (
          <div className="card" style={{ marginTop: '16px' }}>
            <h3 style={{ marginBottom: '12px' }}>🏪 Nearby Stores</h3>
            {stores.map((store, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 0',
                borderBottom: i < stores.length - 1 ? '1px solid #F0F0F0' : 'none',
              }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{store.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#B2BEC3' }}>{store.address}</div>
                </div>
                <span style={{ fontWeight: 700, color: '#74B9FF' }}>{store.distance}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ShoppingList
