import { useState, useEffect } from 'react'

function Confetti() {
  const colors = ['#FF6B6B', '#74B9FF', '#00B894', '#FFEAA7', '#DFE6E9', '#E74C3C', '#6C5CE7']
  const pieces = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    color: colors[Math.floor(Math.random() * colors.length)],
    delay: Math.random() * 2,
    size: 6 + Math.random() * 8,
    shape: Math.random() > 0.5 ? 'circle' : 'rect',
  }))

  return (
    <>
      {pieces.map(p => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            width: p.size,
            height: p.shape === 'rect' ? p.size * 1.5 : p.size,
            borderRadius: p.shape === 'circle' ? '50%' : '2px',
          }}
        />
      ))}
    </>
  )
}

function Result({ dish: finalDish, onFindRecipe, onTryAgain, onBack }) {
  const [loading, setLoading] = useState(false)
  const [showConfetti, setShowConfetti] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  const handleFindRecipe = async () => {
    setLoading(true)
    try {
      // Search TheMealDB for the dish
      const searchTerms = [
        finalDish.name,
        finalDish.name.split(' ').slice(0, 2).join(' '),
        finalDish.cuisine,
      ]

      let meal = null
      for (const term of searchTerms) {
        const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(term)}`)
        const data = await res.json()
        if (data.meals && data.meals.length > 0) {
          meal = data.meals[0]
          break
        }
      }

      if (!meal) {
        // Fallback: get a random meal
        const res = await fetch('https://www.themealdb.com/api/json/v1/1/random.php')
        const data = await res.json()
        meal = data.meals[0]
      }

      // Parse ingredients and measurements
      const ingredients = []
      for (let i = 1; i <= 20; i++) {
        const ing = meal[`strIngredient${i}`]
        const measure = meal[`strMeasure${i}`]
        if (ing && ing.trim()) {
          ingredients.push({
            ingredient: ing.trim(),
            measure: measure ? measure.trim() : '',
          })
        }
      }

      // Parse instructions into steps
      const instructions = meal.strInstructions
        .split(/\r?\n/)
        .filter(s => s.trim().length > 0)
        .map(s => s.replace(/^\d+[\.\)]\s*/, '').trim())

      onFindRecipe({
        name: meal.strMeal,
        image: meal.strMealThumb,
        category: meal.strCategory,
        area: meal.strArea,
        ingredients,
        instructions,
        source: meal.strSource,
        originalDish: finalDish,
      })
    } catch (err) {
      console.error('Recipe fetch error:', err)
      // Create a placeholder recipe
      onFindRecipe({
        name: finalDish.name,
        image: null,
        category: finalDish.cuisine,
        area: finalDish.cuisine,
        ingredients: finalDish.ingredients.map(i => ({ ingredient: i, measure: '' })),
        instructions: ['Recipe details could not be loaded. Try searching online for: ' + finalDish.name],
        source: null,
        originalDish: finalDish,
      })
    }
    setLoading(false)
  }

  if (!finalDish) return null

  return (
    <div className="screen" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
      {showConfetti && <Confetti />}

      <button className="back-btn" onClick={onBack} style={{ alignSelf: 'flex-start' }}>← Back</button>

      <div style={{ marginBottom: '8px' }}>
        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#00B894' }}>🎉 Your perfect dinner is...</span>
      </div>

      <div className="dish-card" style={{ width: '100%' }}>
        <div className="dish-emoji" style={{ fontSize: '5rem' }}>{finalDish.emoji}</div>
        <h3 style={{ fontSize: '1.6rem' }}>{finalDish.name}</h3>
        <p style={{ fontSize: '1rem', marginBottom: '16px' }}>{finalDish.description}</p>
        <div className="dish-tags">
          <span className="dish-tag">{finalDish.cuisine}</span>
          <span className="dish-tag">⏱ {finalDish.cookTime}</span>
          <span className="dish-tag">
            {finalDish.difficulty === 'easy' ? '🟢' : finalDish.difficulty === 'medium' ? '🟡' : '🔴'} {finalDish.difficulty}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', marginTop: '16px' }}>
        <button
          className="btn btn-success btn-block btn-large"
          onClick={handleFindRecipe}
          disabled={loading}
        >
          {loading ? '🔍 Searching recipes...' : '📖 Find Recipe'}
        </button>
        <button className="btn btn-secondary btn-block" onClick={onTryAgain}>
          🔄 Try Again
        </button>
      </div>
    </div>
  )
}

export default Result
