function Recipe({ recipe, onShoppingList, onTimer, onBack }) {
  if (!recipe) return null

  return (
    <div className="screen" style={{ overflowY: 'auto' }}>
      <button className="back-btn" onClick={onBack}>← Back</button>

      {/* Recipe Header */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        {recipe.image && (
          <img
            src={recipe.image}
            alt={recipe.name}
            style={{
              width: '100%',
              height: '200px',
              objectFit: 'cover',
              borderRadius: '16px',
              marginBottom: '12px',
            }}
          />
        )}
        <h2 style={{ marginBottom: '4px' }}>{recipe.name}</h2>
        <div className="dish-tags" style={{ justifyContent: 'center' }}>
          {recipe.category && <span className="dish-tag">{recipe.category}</span>}
          {recipe.area     && <span className="dish-tag">{recipe.area}</span>}
        </div>
      </div>

      {/* Ingredients */}
      <div className="recipe-section card">
        <h3>🛒 Ingredients</h3>
        <ul className="ingredient-list">
          {recipe.ingredients.map((item, i) => (
            <li key={i}>
              <span style={{ fontWeight: 600 }}>{item.measure}</span>{' '}
              {item.ingredient}
            </li>
          ))}
        </ul>
      </div>

      {/* Instructions */}
      <div className="recipe-section card">
        <h3>📝 Instructions</h3>
        <ol className="instruction-list">
          {recipe.instructions.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </div>

      {recipe.source && (
        <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#B2BEC3', marginBottom: '16px' }}>
          Recipe source:{' '}
          <a href={recipe.source} target="_blank" rel="noopener noreferrer" style={{ color: '#74B9FF' }}>
            View Original
          </a>
        </p>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: 'auto', paddingTop: '16px' }}>
        <button className="btn btn-success btn-block btn-large" onClick={onTimer}>
          ⏱ Start Cooking
        </button>
        <button className="btn btn-primary btn-block" onClick={onShoppingList}>
          🛒 Shopping List
        </button>
      </div>
    </div>
  )
}

export default Recipe
