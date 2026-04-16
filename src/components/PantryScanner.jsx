import { useState, useRef, useEffect, useCallback } from 'react'

const CATEGORY_EMOJI = {
  vegetables:        '🥬',
  fruits:            '🍎',
  meat:              '🥩',
  dairy:             '🧀',
  cereals:           '🥣',
  bread:             '🍞',
  pasta_rice_grains: '🍚',
  canned_jarred:     '🫙',
  condiments_sauces: '🍯',
  spices_herbs:      '🌿',
  baking:            '🧁',
  snacks:            '🍿',
  drinks:            '🥤',
  frozen:            '🧊',
  unknown:           '❓',
}

const CATEGORY_LABEL = {
  vegetables:        'Vegetables',
  fruits:            'Fruit',
  meat:              'Meat & Seafood',
  dairy:             'Dairy & Eggs',
  cereals:           'Cereals & Oats',
  bread:             'Bread & Wraps',
  pasta_rice_grains: 'Pasta, Rice & Grains',
  canned_jarred:     'Canned & Jarred',
  condiments_sauces: 'Condiments & Sauces',
  spices_herbs:      'Spices & Herbs',
  baking:            'Baking',
  snacks:            'Snacks & Nuts',
  drinks:            'Drinks',
  frozen:            'Frozen Foods',
  unknown:           'Unrecognised — Search?',
}

// Category display order
const CATEGORY_ORDER = [
  'vegetables','fruits','meat','dairy','cereals','bread',
  'pasta_rice_grains','canned_jarred','condiments_sauces',
  'spices_herbs','baking','snacks','drinks','frozen','unknown',
]

function PantryScanner({ onIngredientsFound, onClose }) {
  const [stage, setStage] = useState('intro')
  const [cameraError, setCameraError] = useState(null)
  const [cameraReady, setCameraReady] = useState(false)
  const [foundItems, setFoundItems] = useState([])
  const [scanProgress, setScanProgress] = useState(0)
  const [scanStatus, setScanStatus] = useState('')
  const [selectedItems, setSelectedItems] = useState(new Set())
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => () => stopCamera(), [])

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) videoRef.current.srcObject = null
    setCameraReady(false)
  }

  const startCamera = async () => {
    setCameraError(null)
    setCameraReady(false)
    setStage('scanning')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })
      streamRef.current = stream
      const video = videoRef.current
      if (video) {
        video.srcObject = stream
        video.onloadedmetadata = () => {
          video.play()
            .then(() => setCameraReady(true))
            .catch(() => { video.muted = true; video.play().then(() => setCameraReady(true)).catch(() => { setCameraError('Could not start video. Try again.'); setStage('intro') }) })
        }
        video.onerror = () => { setCameraError('Video error. Please try again.'); setStage('intro') }
      }
    } catch (err) {
      stopCamera()
      if (err.name === 'NotAllowedError') setCameraError('Camera access denied. Allow camera in browser settings.')
      else if (err.name === 'NotFoundError') setCameraError('No camera found on this device.')
      else if (err.name === 'NotReadableError') setCameraError('Camera is in use by another app.')
      else setCameraError(`Camera error: ${err.message}`)
      setStage('intro')
    }
  }

  const captureAndAnalyze = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height)
    stopCamera()
    setStage('processing')
    setScanProgress(0)
    setScanStatus('Uploading image...')

    // Animate progress bar
    let progress = 0
    const progressInterval = setInterval(() => {
      progress += 3 + Math.random() * 6
      if (progress >= 88) { progress = 88; clearInterval(progressInterval) }
      setScanProgress(Math.round(progress))
      if (progress < 20) setScanStatus('Uploading image...')
      else if (progress < 45) setScanStatus('Identifying food items...')
      else if (progress < 70) setScanStatus('Categorising ingredients...')
      else setScanStatus('Almost done...')
    }, 250)

    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.85)

    fetch('http://localhost:3099/api/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: imageDataUrl }),
    })
      .then(r => r.json())
      .then(data => {
        clearInterval(progressInterval)
        setScanProgress(100)
        setScanStatus('Done!')
        setTimeout(() => {
          if (data.found && data.items?.length > 0) {
            setFoundItems(data.items)
            setSelectedItems(new Set(data.items.map(d => d.name)))
            setStage('results')
          } else {
            setFoundItems([])
            setSelectedItems(new Set())
            setStage('not-found')
          }
        }, 400)
      })
      .catch(err => {
        clearInterval(progressInterval)
        console.error('Scan error:', err)
        setScanProgress(100)
        setFoundItems([])
        setSelectedItems(new Set())
        setStage('not-found')
      })
  }, [])

  const toggleItem = name => {
    setSelectedItems(prev => {
      const next = new Set(prev)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })
  }

  const handleDone = () => {
    const selected = foundItems.filter(i => selectedItems.has(i.name)).map(i => i.name)
    onIngredientsFound(selected)
    onClose()
  }

  // Group and order items by category
  const groupedItems = {}
  foundItems.forEach(item => {
    const cat = item.category || 'unknown'
    if (!groupedItems[cat]) groupedItems[cat] = []
    groupedItems[cat].push(item)
  })
  const orderedCategories = CATEGORY_ORDER.filter(c => groupedItems[c]?.length > 0)

  // Google Lens URL for an item name
  const googleLensUrl = name =>
    `https://lens.google.com/search?q=${encodeURIComponent(name + ' food ingredient')}`

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: '#0a0a0a', zIndex: 2000,
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Close button */}
      <button onClick={() => { stopCamera(); onClose() }} style={{
        position: 'absolute', top: 16, right: 16,
        background: 'rgba(255,255,255,0.2)', border: 'none',
        color: 'white', width: 44, height: 44, borderRadius: '50%',
        cursor: 'pointer', fontSize: '1.3rem', zIndex: 2100,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>✕</button>

      {/* ── INTRO ─────────────────────────────────────── */}
      {stage === 'intro' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <div style={{ fontSize: '5rem', marginBottom: 16 }}>📷</div>
          <h2 style={{ color: 'white', marginBottom: 8, textAlign: 'center', fontFamily: 'Nunito, sans-serif' }}>
            Pantry Scanner
          </h2>
          <p style={{ color: '#B2BEC3', marginBottom: 8, lineHeight: 1.6, textAlign: 'center', maxWidth: 340, fontFamily: 'Nunito, sans-serif', fontSize: '0.9rem' }}>
            Point your camera at your fridge, pantry, or bench and we'll identify your ingredients — vegetables, cereals, sauces, snacks and more.
          </p>
          <p style={{ color: '#636E72', marginBottom: 28, fontSize: '0.8rem', fontFamily: 'Nunito, sans-serif', textAlign: 'center', maxWidth: 300 }}>
            Tip: good lighting helps a lot!
          </p>
          <button onClick={startCamera} style={{
            padding: '16px 40px', background: 'linear-gradient(135deg, #00B894, #00A381)',
            color: 'white', border: 'none', borderRadius: 14,
            fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '1.1rem',
            cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,184,148,0.4)',
          }}>
            📷 Open Camera
          </button>
          {cameraError && (
            <div style={{
              background: 'rgba(255,107,107,0.15)', border: '1px solid rgba(255,107,107,0.4)',
              borderRadius: 12, padding: '14px 18px', marginTop: 20, color: '#FF8A8A',
              fontSize: '0.85rem', lineHeight: 1.6, maxWidth: 340, textAlign: 'center',
              fontFamily: 'Nunito, sans-serif',
            }}>
              {cameraError}
            </div>
          )}
        </div>
      )}

      {/* ── SCANNING (live camera) ────────────────────── */}
      {stage === 'scanning' && (
        <div style={{ flex: 1, position: 'relative' }}>
          <video ref={videoRef} autoPlay playsInline muted style={{
            position: 'absolute', top: 0, left: 0,
            width: '100%', height: '100%', objectFit: 'cover', background: '#111',
          }} />

          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}>
            {/* Top hint */}
            <div style={{
              padding: '20px 16px', textAlign: 'center',
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.55), transparent)',
            }}>
              <span style={{
                background: 'rgba(0,0,0,0.6)', color: 'white', backdropFilter: 'blur(4px)',
                padding: '8px 20px', borderRadius: 24, fontSize: '0.9rem', fontWeight: 700,
                fontFamily: 'Nunito, sans-serif',
              }}>
                {cameraReady ? '🔍 Point at your ingredients' : '⏳ Starting camera...'}
              </span>
            </div>

            {/* Scan frame */}
            {cameraReady && (
              <div style={{ position: 'absolute', top: '12%', left: '8%', right: '8%', bottom: '22%', pointerEvents: 'none' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: 32, height: 32, borderTop: '3px solid #00B894', borderLeft: '3px solid #00B894', borderRadius: '4px 0 0 0' }} />
                <div style={{ position: 'absolute', top: 0, right: 0, width: 32, height: 32, borderTop: '3px solid #00B894', borderRight: '3px solid #00B894', borderRadius: '0 4px 0 0' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, width: 32, height: 32, borderBottom: '3px solid #00B894', borderLeft: '3px solid #00B894', borderRadius: '0 0 0 4px' }} />
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, borderBottom: '3px solid #00B894', borderRight: '3px solid #00B894', borderRadius: '0 0 4px 0' }} />
                <div style={{
                  position: 'absolute', left: 4, right: 4, height: 2,
                  background: 'linear-gradient(90deg, transparent, #00B894, transparent)',
                  animation: 'scanLine 2.5s ease-in-out infinite',
                }} />
              </div>
            )}

            {/* Bottom — capture button */}
            <div style={{
              padding: '24px 16px 36px',
              background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
            }}>
              {!cameraReady && (
                <span style={{ color: '#B2BEC3', fontSize: '0.85rem', fontFamily: 'Nunito, sans-serif', fontWeight: 600 }}>
                  Loading camera feed...
                </span>
              )}
              <button
                onClick={captureAndAnalyze}
                disabled={!cameraReady}
                style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: cameraReady ? '#00B894' : '#444',
                  border: '4px solid white', cursor: cameraReady ? 'pointer' : 'default',
                  fontSize: '1.6rem', color: 'white',
                  boxShadow: cameraReady ? '0 4px 20px rgba(0,184,148,0.5)' : 'none',
                  opacity: cameraReady ? 1 : 0.5, transition: 'all 0.2s',
                }}>
                📸
              </button>
              <span style={{ color: 'white', fontSize: '0.8rem', fontFamily: 'Nunito, sans-serif', fontWeight: 600, opacity: 0.8 }}>
                {cameraReady ? 'Tap to scan' : 'Waiting for camera...'}
              </span>
            </div>
          </div>
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
      )}

      {/* ── PROCESSING ───────────────────────────────── */}
      {stage === 'processing' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <div style={{ fontSize: '3.5rem', marginBottom: 20 }}>🔍</div>
          <h2 style={{ color: 'white', marginBottom: 12, fontFamily: 'Nunito, sans-serif' }}>
            Scanning ingredients...
          </h2>
          <div style={{ width: 280, height: 8, background: 'rgba(255,255,255,0.15)', borderRadius: 4, overflow: 'hidden', margin: '0 auto 14px' }}>
            <div style={{ height: '100%', background: 'linear-gradient(90deg, #00B894, #74B9FF)', borderRadius: 4, width: `${scanProgress}%`, transition: 'width 0.35s ease' }} />
          </div>
          <p style={{ color: '#B2BEC3', fontSize: '0.9rem', fontFamily: 'Nunito, sans-serif', fontWeight: 600 }}>
            {scanStatus}
          </p>
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
      )}

      {/* ── RESULTS ──────────────────────────────────── */}
      {stage === 'results' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f8f9fa' }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #00B894, #00A381)',
            color: 'white', padding: '18px 20px 14px',
            textAlign: 'center', fontFamily: 'Nunito, sans-serif',
          }}>
            <h2 style={{ color: 'white', marginBottom: 4, fontSize: '1.25rem' }}>
              🎉 Found {foundItems.length} ingredient{foundItems.length !== 1 ? 's' : ''}!
            </h2>
            <p style={{ fontSize: '0.8rem', opacity: 0.9, margin: 0 }}>
              Tap to deselect anything incorrect • ❓ items can be searched
            </p>
          </div>

          {/* Scrollable items */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px 8px' }}>
            {orderedCategories.map(category => (
              <div key={category} style={{ marginBottom: 16 }}>
                <h3 style={{
                  fontSize: '0.8rem', color: '#636E72', marginBottom: 8,
                  fontFamily: 'Nunito, sans-serif', fontWeight: 800,
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>
                  {CATEGORY_EMOJI[category]} {CATEGORY_LABEL[category] || category}
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                  {groupedItems[category].map(item => {
                    const isSelected = selectedItems.has(item.name)
                    return (
                      <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <button
                          onClick={() => toggleItem(item.name)}
                          style={{
                            padding: '7px 12px',
                            borderRadius: 20,
                            border: `2px solid ${isSelected ? '#00B894' : '#DFE6E9'}`,
                            background: isSelected ? '#E8F5F1' : '#F5F5F5',
                            color: isSelected ? '#2D3436' : '#999',
                            fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: '0.82rem',
                            cursor: 'pointer', transition: 'all 0.15s',
                            textDecoration: isSelected ? 'none' : 'line-through',
                            display: 'flex', alignItems: 'center', gap: 4,
                          }}
                        >
                          {isSelected && <span style={{ color: '#00B894', fontSize: '0.75rem' }}>✓</span>}
                          {item.name}
                          <span style={{ fontSize: '0.62rem', color: '#B2BEC3' }}>{item.confidence}%</span>
                        </button>

                        {/* Google Lens button for unknowns */}
                        {item.needsSearch && (
                          <a
                            href={googleLensUrl(item.name)}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={`Search "${item.name}" on Google`}
                            style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              width: 26, height: 26, borderRadius: '50%',
                              background: '#4285F4', color: 'white',
                              fontSize: '0.7rem', fontWeight: 800,
                              textDecoration: 'none', flexShrink: 0,
                              boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                            }}
                          >
                            G
                          </a>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{
            padding: '12px 18px', borderTop: '1px solid #E9ECEF', background: 'white',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            boxShadow: '0 -2px 8px rgba(0,0,0,0.06)',
          }}>
            <div>
              <span style={{ fontSize: '0.85rem', color: '#636E72', fontWeight: 700, fontFamily: 'Nunito, sans-serif' }}>
                {selectedItems.size} selected
              </span>
              <span style={{ fontSize: '0.75rem', color: '#B2BEC3', fontFamily: 'Nunito, sans-serif', marginLeft: 6 }}>
                of {foundItems.length}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => { setStage('intro'); setCameraError(null) }}
                style={{
                  padding: '10px 18px', background: 'transparent',
                  color: '#636E72', border: '2px solid #DFE6E9', borderRadius: 10,
                  fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                }}
              >
                📷 Rescan
              </button>
              <button
                onClick={handleDone}
                style={{
                  padding: '10px 22px', background: '#00B894', color: 'white',
                  border: 'none', borderRadius: 10, fontFamily: 'Nunito, sans-serif',
                  fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,184,148,0.3)',
                }}
              >
                ✓ Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── NOT FOUND ─────────────────────────────────── */}
      {stage === 'not-found' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <div style={{ fontSize: '4rem', marginBottom: 16 }}>🔍</div>
          <h2 style={{ color: 'white', marginBottom: 10, fontFamily: 'Nunito, sans-serif', textAlign: 'center' }}>
            NOT FOUND
          </h2>
          <p style={{ color: '#B2BEC3', fontSize: '0.9rem', fontFamily: 'Nunito, sans-serif', textAlign: 'center', maxWidth: 320, lineHeight: 1.6, marginBottom: 10 }}>
            Couldn't identify any ingredients. Try better lighting or moving closer.
          </p>
          <p style={{ color: '#636E72', fontSize: '0.8rem', fontFamily: 'Nunito, sans-serif', textAlign: 'center', maxWidth: 300, lineHeight: 1.5, marginBottom: 28 }}>
            You can also add ingredients manually using the text box or 🎤 microphone.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={() => { setStage('intro'); setCameraError(null) }}
              style={{
                padding: '14px 28px', background: '#74B9FF', color: 'white',
                border: 'none', borderRadius: 12, fontFamily: 'Nunito, sans-serif',
                fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
              }}
            >
              📷 Try Again
            </button>
            <button
              onClick={onClose}
              style={{
                padding: '14px 28px', background: 'rgba(255,255,255,0.12)', color: 'white',
                border: '2px solid rgba(255,255,255,0.25)', borderRadius: 12,
                fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
              }}
            >
              ← Type Manually
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scanLine {
          0%   { top: 0; }
          50%  { top: calc(100% - 2px); }
          100% { top: 0; }
        }
      `}</style>
    </div>
  )
}

export default PantryScanner
