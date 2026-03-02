import { useNavigate } from 'react-router-dom'

export default function Landing() {
  const navigate = useNavigate()

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
          onClick={() => navigate('/session/new')}
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
      <p className="font-mono text-retro-cyan/60 text-xs">@nonetheweisser 2026</p>
    </div>
  )
}
