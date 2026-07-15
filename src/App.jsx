import { useCallback, useRef, useState } from 'react'
import './App.css'
import coinBack from './assets/coin-back.png'
import coinFront from './assets/coin-front.jpg'

function App() {
  const [power, setPower] = useState(0)
  const [isCharging, setIsCharging] = useState(false)
  const [isFlipping, setIsFlipping] = useState(false)
  const [result, setResult] = useState(null)
  const [showResult, setShowResult] = useState(false)
  const [flipDuration, setFlipDuration] = useState(0)
  const chargeStart = useRef(null)
  const chargeInterval = useRef(null)

  const MAX_CHARGE_TIME = 3000

  const getResult = () => {
    const rand = Math.random() * 100
    if (rand < 49.5) return 'heads'
    if (rand < 99) return 'tails'
    return 'edge'
  }

  const releaseCoin = useCallback(() => {
    cancelAnimationFrame(chargeInterval.current)
    chargeInterval.current = null

    const elapsed = Date.now() - chargeStart.current
    const finalPower = Math.min(elapsed / MAX_CHARGE_TIME, 1)
    setPower(finalPower)
    setIsCharging(false)

    const duration = 1 + finalPower * 3
    setFlipDuration(duration)
    setIsFlipping(true)

    const coinResult = getResult()

    setTimeout(() => {
      setResult(coinResult)
      setIsFlipping(false)
      setShowResult(true)
      setPower(0)
    }, duration * 1000)
  }, [])

  const startCharge = useCallback(() => {
    if (isFlipping) return
    setResult(null)
    setShowResult(false)
    setIsCharging(true)
    chargeStart.current = Date.now()

    const tick = () => {
      const elapsed = Date.now() - chargeStart.current
      const currentPower = Math.min(elapsed / MAX_CHARGE_TIME, 1)
      setPower(currentPower)

      if (currentPower >= 1) {
        releaseCoin()
      } else {
        chargeInterval.current = requestAnimationFrame(tick)
      }
    }
    chargeInterval.current = requestAnimationFrame(tick)
  }, [isFlipping, releaseCoin])

  const handlePointerDown = (e) => {
    e.preventDefault()
    startCharge()
  }

  const handlePointerUp = (e) => {
    e.preventDefault()
    if (isCharging) releaseCoin()
  }

  const getResultEmoji = () => {
    if (result === 'heads') return ''
    if (result === 'tails') return ''
    if (result === 'edge') return '🧍'
    return ''
  }

  const getResultText = () => {
    if (result === 'heads') return '正面！'
    if (result === 'tails') return '背面！'
    if (result === 'edge') return '立住了！(仅 1% 概率！)'
    return ''
  }

  const getPowerLabel = () => {
    if (power === 0) return '就绪'
    if (power < 0.33) return '弱'
    if (power < 0.66) return '中'
    if (power < 1) return '强'
    return '满！'
  }

  return (
    <div className="app">
      <div className="bg-gradient" />

      <div className="main-container">
        {/* Power Bar */}
        <div className="power-bar-container">
          <div className="power-label">{getPowerLabel()}</div>
          <div className="power-bar-track">
            <div
              className={`power-bar-fill ${isCharging ? 'charging' : ''} ${power >= 1 ? 'maxed' : ''}`}
              style={{ height: `${power * 100}%` }}
            />
            <div className="power-markers">
              <div className="marker" style={{ bottom: '33%' }} />
              <div className="marker" style={{ bottom: '66%' }} />
            </div>
          </div>
          <div className="power-time">{(power * 3).toFixed(1)}s</div>
        </div>

        {/* Main Content */}
        <div className="content">
          <h1 className="title">
            <span className="title-icon">🪙</span> 赛博硬币
          </h1>

          {/* Coin */}
          <div className="coin-stage">
            <div
              className={`coin ${isFlipping ? 'flipping' : ''} ${showResult && result ? `result-${result}` : ''}`}
              style={{
                '--flip-duration': `${flipDuration}s`,
                '--flip-rotations': `${Math.floor(4 + power * 14)}`,
              }}
            >
              <div className="coin-inner">
                <div className="coin-face coin-heads">
                  <img src={coinFront} alt="正面" className="coin-img" />
                </div>
                <div className="coin-face coin-tails">
                  <img src={coinBack} alt="背面" className="coin-img" />
                </div>
              </div>
            </div>
            {isFlipping && <div className="coin-shadow" style={{ '--flip-duration': `${flipDuration}s` }} />}
          </div>

          {/* Result */}
          <div className={`result ${showResult ? 'show' : ''} ${result === 'edge' ? 'rare' : ''}`}>
            <span className="result-emoji">{getResultEmoji()}</span>
            <span className="result-text">{getResultText()}</span>
          </div>

          {/* Button */}
          <button
            className={`toss-btn ${isCharging ? 'charging' : ''} ${isFlipping ? 'disabled' : ''}`}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerLeave={(e) => { if (isCharging) handlePointerUp(e) }}
            disabled={isFlipping}
          >
            <span className="btn-text">
              {isFlipping ? '✨ 抛币中...' : isCharging ? '⚡ 蓄力中...' : '👆 按住抛币'}
            </span>
            <div className="btn-charge-bg" style={{ transform: `scaleX(${power})` }} />
          </button>

          <div className="odds">
            <div className="odd-item">
              <span>正</span>
              <span>49.5%</span>
            </div>
            <div className="odd-item">
              <span>背</span>
              <span>49.5%</span>
            </div>
            <div className="odd-item rare-odd">
              <span>立</span>
              <span>1%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
