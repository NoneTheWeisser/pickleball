import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

export default function Landing() {
  const navigate = useNavigate()
  const [showStartModal, setShowStartModal] = useState(false)
  const [showLoadModal, setShowLoadModal] = useState(false)
  const [activeSessions, setActiveSessions] = useState([])

  useEffect(() => {
    fetch('/api/sessions/active')
      .then(r => r.json())
      .then(setActiveSessions)
      .catch(() => { })
  }, [])

  useEffect(() => {
    if (!showStartModal && !showLoadModal) return
    function onKey(e) {
      if (e.key === 'Escape') {
        setShowStartModal(false)
        setShowLoadModal(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showStartModal, showLoadModal])

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen gap-10 px-4">
      <div className="text-center">
        <p className="font-mono text-retro-cyan text-sm tracking-[0.3em] mb-2">PRESS START</p>
        <h1 className="font-display text-6xl sm:text-7xl tracking-widest text-retro-cream uppercase">
          Pickleball
        </h1>
        <h1 className="font-display text-5xl sm:text-6xl tracking-[0.4em] text-retro-green -mt-1">
          Night
        </h1>
      </div>

      <div className="flex flex-col items-center gap-4">
        <button
          onClick={() => setShowStartModal(true)}
          className="font-display text-xl tracking-widest px-10 py-4 bg-retro-green text-retro-dark
            border-2 border-retro-green hover:bg-retro-dark hover:text-retro-green
            transition-all duration-200 shadow-retro-glow"
        >
          Start
        </button>
        {activeSessions.length > 0 && (
          <button
            onClick={() => setShowLoadModal(true)}
            className="font-display text-sm tracking-widest px-8 py-3 bg-transparent text-retro-gold
              border-2 border-retro-gold/50 hover:border-retro-gold hover:text-retro-cream
              transition-all duration-200"
          >
            Load Game
          </button>
        )}
        <button
          onClick={() => navigate('/leaderboard')}
          className="font-display text-sm tracking-widest px-8 py-3 bg-transparent text-retro-cyan
            border-2 border-retro-cyan/50 hover:border-retro-cyan hover:text-retro-cream
            transition-all duration-200"
        >
          Leaderboard
        </button>
      </div>

      <button
        onClick={() => navigate('/options')}
        className="font-mono text-retro-cream/30 text-xs tracking-[0.3em] hover:text-retro-cream/60 transition-colors"
      >
        OPTIONS
      </button>

      <p className="absolute bottom-4 font-mono text-retro-cream/20 text-xs tracking-widest">
        @nonetheweisser 2026
      </p>

      {/* Start modal */}
      {showStartModal && (
        <div
          className="fixed inset-0 bg-retro-dark/90 flex items-center justify-center px-4 z-50"
          onClick={() => setShowStartModal(false)}
        >
          <div
            className="w-full max-w-lg flex flex-col gap-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <p className="font-mono text-retro-pink text-xs tracking-[0.4em] mb-1">INSERT COIN</p>
              <h2 className="font-display text-4xl tracking-widest text-retro-cream">Select Mode</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => navigate('/session/new')}
                className="flex flex-col items-start gap-2 p-5 bg-retro-card border-2 border-retro-green/50
                  hover:border-retro-green hover:bg-retro-green/10 transition-all text-left group"
              >
                <span className="font-display text-xl tracking-wider text-retro-green group-hover:shadow-retro-glow">
                  Co-Op Battle
                </span>
                <span className="font-mono text-retro-cream/50 text-xs leading-relaxed">
                  2v2 · full session with rotation
                </span>
              </button>

              <button
                onClick={() => navigate('/session/new?mode=duel')}
                className="flex flex-col items-start gap-2 p-5 bg-retro-card border-2 border-retro-pink/50
                  hover:border-retro-pink hover:bg-retro-pink/10 transition-all text-left group"
              >
                <span className="font-display text-xl tracking-wider text-retro-pink">
                  Head to Head
                </span>
                <span className="font-mono text-retro-cream/50 text-xs leading-relaxed">
                  1v1 · personal rivalry
                </span>
              </button>
            </div>

            <button
              onClick={() => setShowStartModal(false)}
              className="font-mono text-retro-cream/30 text-xs tracking-widest hover:text-retro-cream/60
                transition-colors self-center"
            >
              [ ESC ] cancel
            </button>
          </div>
        </div>
      )}

      {/* Load Game modal */}
      {showLoadModal && (
        <div
          className="fixed inset-0 bg-retro-dark/90 flex items-center justify-center px-4 z-50"
          onClick={() => setShowLoadModal(false)}
        >
          <div
            className="w-full max-w-lg flex flex-col gap-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <p className="font-mono text-retro-gold text-xs tracking-[0.4em] mb-1">CONTINUE</p>
              <h2 className="font-display text-4xl tracking-widest text-retro-cream">Load Game</h2>
            </div>

            <div className="flex flex-col gap-3">
              {activeSessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => navigate(`/session/${session.id}/game`)}
                  className="w-full flex flex-col gap-1 p-4 bg-retro-card border-2 border-retro-gold/40
                    hover:border-retro-gold hover:bg-retro-gold/10 transition-all text-left"
                >
                  <span className="font-mono text-retro-gold text-sm">
                    {(session.players ?? []).map(p => p.name).join(' · ')}
                  </span>
                  <span className="font-mono text-retro-cream/40 text-xs">
                    {session.completed_games} game{session.completed_games !== '1' ? 's' : ''} played
                    · {formatDate(session.started_at)}
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowLoadModal(false)}
              className="font-mono text-retro-cream/30 text-xs tracking-widest hover:text-retro-cream/60
                transition-colors self-center"
            >
              [ ESC ] cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
