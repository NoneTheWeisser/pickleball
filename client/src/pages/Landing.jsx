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
      <button
        onClick={() => navigate('/session/new')}
        className="font-display text-xl tracking-widest px-10 py-4 bg-retro-green text-retro-dark
          border-2 border-retro-green hover:bg-retro-dark hover:text-retro-green
          transition-all duration-200 shadow-retro-glow"
      >
        New Game
      </button>
      <p className="font-mono text-retro-cyan/60 text-xs">Court 1 • 2–3 players per side</p>
    </div>
  )
}
