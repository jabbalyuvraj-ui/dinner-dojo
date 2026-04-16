import { useState, useEffect, useRef } from 'react'

function Timer({ recipeData, onBack }) {
  const [minutes, setMinutes] = useState(30)
  const [seconds, setSeconds] = useState(0)
  const [totalSeconds, setTotalSeconds] = useState(30 * 60)
  const [remaining, setRemaining] = useState(30 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [isDone, setIsDone] = useState(false)
  const intervalRef = useRef(null)
  const audioRef = useRef(null)

  // Parse cook time from recipe if available
  useEffect(() => {
    if (recipeData?.originalDish?.cookTime) {
      const match = recipeData.originalDish.cookTime.match(/(\d+)/)
      if (match) {
        const mins = parseInt(match[1])
        setMinutes(mins)
        setTotalSeconds(mins * 60)
        setRemaining(mins * 60)
      }
    }
  }, [recipeData])

  useEffect(() => {
    if (isRunning && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current)
            setIsRunning(false)
            setIsDone(true)
            playAlarm()
            sendNotification()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(intervalRef.current)
  }, [isRunning, remaining])

  const playAlarm = () => {
    try {
      // Create a beeping sound using Web Audio API
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const playBeep = (time) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.frequency.value = 880
        osc.type = 'sine'
        gain.gain.value = 0.3
        osc.start(time)
        osc.stop(time + 0.2)
      }
      // Play 5 beeps
      for (let i = 0; i < 5; i++) {
        playBeep(ctx.currentTime + i * 0.4)
      }
    } catch (e) {
      console.log('Audio not supported')
    }
  }

  const sendNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('🍳 Timer Done!', {
        body: `Your ${recipeData?.name || 'dish'} should be ready!`,
        icon: '/favicon.svg',
      })
    }
  }

  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }

  const handleStart = () => {
    if (!isRunning && remaining === totalSeconds) {
      // Starting fresh
      const total = minutes * 60 + seconds
      setTotalSeconds(total)
      setRemaining(total)
    }
    requestNotificationPermission()
    setIsRunning(true)
    setIsDone(false)
  }

  const handlePause = () => {
    setIsRunning(false)
    clearInterval(intervalRef.current)
  }

  const handleReset = () => {
    setIsRunning(false)
    setIsDone(false)
    clearInterval(intervalRef.current)
    const total = minutes * 60 + seconds
    setTotalSeconds(total)
    setRemaining(total)
  }

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const progress = totalSeconds > 0 ? ((totalSeconds - remaining) / totalSeconds) * 100 : 0

  // SVG circle for progress
  const radius = 100
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className="screen" style={{ justifyContent: 'center', alignItems: 'center' }}>
      <button className="back-btn" onClick={onBack} style={{ alignSelf: 'flex-start' }}>← Back to Recipe</button>

      <h2 style={{ textAlign: 'center' }}>⏱ Cooking Timer</h2>

      {recipeData?.name && (
        <p style={{ color: '#636E72', textAlign: 'center', fontWeight: 600, marginBottom: '16px' }}>
          {recipeData.originalDish?.emoji || '🍳'} {recipeData.name}
        </p>
      )}

      {/* Timer Circle */}
      <div style={{ position: 'relative', width: '240px', height: '240px', margin: '16px auto' }}>
        <svg width="240" height="240" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="120" cy="120" r={radius} fill="none" stroke="#DFE6E9" strokeWidth="10" />
          <circle
            cx="120" cy="120" r={radius}
            fill="none"
            stroke={isDone ? '#FF6B6B' : isRunning ? '#00B894' : '#74B9FF'}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
        }}>
          <div className="timer-display" style={{
            color: isDone ? '#FF6B6B' : '#2D3436',
            animation: isDone ? 'pulse 1s infinite' : 'none',
          }}>
            {formatTime(remaining)}
          </div>
          <div className="timer-label">
            {isDone ? '🔔 Done!' : isRunning ? 'Cooking...' : 'Ready'}
          </div>
        </div>
      </div>

      {/* Set time (only when not running) */}
      {!isRunning && !isDone && (
        <div className="timer-set">
          <label style={{ fontWeight: 600 }}>Minutes:</label>
          <input
            type="number"
            value={minutes}
            min="0"
            max="180"
            onChange={(e) => {
              const m = parseInt(e.target.value) || 0
              setMinutes(m)
              const total = m * 60 + seconds
              setTotalSeconds(total)
              setRemaining(total)
            }}
          />
          <label style={{ fontWeight: 600 }}>Sec:</label>
          <input
            type="number"
            value={seconds}
            min="0"
            max="59"
            onChange={(e) => {
              const s = parseInt(e.target.value) || 0
              setSeconds(s)
              const total = minutes * 60 + s
              setTotalSeconds(total)
              setRemaining(total)
            }}
          />
        </div>
      )}

      {/* Controls */}
      <div className="timer-controls">
        {!isRunning && !isDone && (
          <button className="btn btn-success btn-large" onClick={handleStart}>
            ▶ Start
          </button>
        )}
        {isRunning && (
          <button className="btn btn-secondary btn-large" onClick={handlePause}>
            ⏸ Pause
          </button>
        )}
        {(isRunning || isDone || remaining !== totalSeconds) && (
          <button className="btn btn-danger" onClick={handleReset}>
            ↺ Reset
          </button>
        )}
        {!isRunning && remaining !== totalSeconds && !isDone && (
          <button className="btn btn-success" onClick={handleStart}>
            ▶ Resume
          </button>
        )}
      </div>
    </div>
  )
}

export default Timer
