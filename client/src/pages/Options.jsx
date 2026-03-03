import { useNavigate } from 'react-router-dom'

const MENU_ITEMS = [
  {
    key: 'admin',
    label: 'Admin Panel',
    description: 'Manage players and sessions',
    path: '/admin',
    color: 'retro-pink',
  },
]

export default function Options() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-10 px-4">
      <div className="text-center">
        <p className="font-mono text-retro-cyan text-sm tracking-[0.3em] mb-2">SYSTEM</p>
        <h1 className="font-display text-6xl tracking-widest text-retro-cream uppercase">
          Options
        </h1>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-sm">
        {MENU_ITEMS.map((item) => (
          <button
            key={item.key}
            onClick={() => navigate(item.path)}
            className={`w-full flex flex-col gap-1 p-4 bg-retro-card border-2 border-${item.color}/40
              hover:border-${item.color} hover:bg-${item.color}/10 transition-all text-left`}
          >
            <span className={`font-mono text-${item.color} text-sm tracking-wider`}>
              {item.label}
            </span>
            <span className="font-mono text-retro-cream/40 text-xs">
              {item.description}
            </span>
          </button>
        ))}
      </div>

      <button
        onClick={() => navigate('/')}
        className="font-mono text-retro-cream/30 text-xs tracking-[0.3em] hover:text-retro-cream/60 transition-colors"
      >
        &larr; BACK
      </button>
    </div>
  )
}
