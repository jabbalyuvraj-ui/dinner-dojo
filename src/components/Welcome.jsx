import Logo from './Logo'

function Welcome({ onStart }) {
  return (
    <div className="screen" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: '24px' }}>
      <Logo size={180} />
      <div>
        <h1 style={{ fontSize: '1.6rem', lineHeight: 1.3 }}>Your Ultimate<br />Dinner Dojo</h1>
        <p style={{ color: '#636E72', marginTop: '8px', fontWeight: 600 }}>
          Master the art of dinner decisions 🥋
        </p>
      </div>
      <button className="btn btn-primary btn-large" onClick={onStart}>
        🥢 Click Start
      </button>
      <p style={{ color: '#B2BEC3', fontSize: '0.8rem', fontWeight: 600 }}>
        Find the perfect dinner in minutes
      </p>
    </div>
  )
}

export default Welcome
