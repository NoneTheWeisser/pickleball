import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'

export default function Landing() {
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (!showModal) return
    function onKey(e) {
      if (e.key === 'Escape') setShowModal(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showModal])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-10 px-4">
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
          onClick={() => setShowModal(true)}
          className="font-display text-xl tracking-widest px-10 py-4 bg-retro-green text-retro-dark
            border-2 border-retro-green hover:bg-retro-dark hover:text-retro-green
            transition-all duration-200 shadow-retro-glow"
        >
          Start
        </button>
        <button
          onClick={() => navigate('/leaderboard')}
          className="font-display text-sm tracking-widest px-8 py-3 bg-transparent text-retro-cyan
            border-2 border-retro-cyan/50 hover:border-retro-cyan hover:text-retro-cream
            transition-all duration-200"
        >
          View Leaderboard
        </button>
      </div>
      <Link
        to="/admin"
        className="font-mono text-retro-cyan/60 text-xs hover:text-retro-cyan/60 transition-none"
      >
        @nonetheweisser 2026
      </Link>

      {showModal && (
        <div
          className="fixed inset-0 bg-retro-dark/90 flex items-center justify-center px-4 z-50"
          onClick={() => setShowModal(false)}
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
              onClick={() => setShowModal(false)}
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
