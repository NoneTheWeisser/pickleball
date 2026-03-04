import PlayerCard from './PlayerCard'

/**
 * Arcade-style Team 1 vs Team 2 display with trapezoidal panels.
 * Used in GameInProgress, VsPreview, and LineupEditor.
 * When onPlayerTap is provided, player cards are tappable for swap selection.
 */
export default function ArcadeMatchup({
  team1,
  team2,
  className = '',
  animate = false,
  onPlayerTap,
  selectedPlayerId,
}) {
  const animateClass = animate ? 'animate-slide-in-left' : ''
  const animateClass2 = animate ? 'animate-slide-in-right [animation-delay:100ms]' : ''
  const vsAnimate = animate ? 'animate-vs-pop [animation-delay:150ms]' : ''
  const interactive = !!onPlayerTap

  function PlayerSlot({ player, slot, accent }) {
    const isSelected = selectedPlayerId === player?.id
    const base =
      'flex-1 min-w-0 aspect-square min-h-0 overflow-hidden rounded transition-all ' +
      (interactive ? 'cursor-pointer ' : '')
    const selectedStyles =
      accent === 'green'
        ? 'ring-2 ring-retro-green shadow-retro-glow'
        : 'ring-2 ring-retro-cyan'
    const unselectedStyles =
      accent === 'green'
        ? 'hover:ring-2 hover:ring-retro-green/60'
        : 'hover:ring-2 hover:ring-retro-cyan/60'

    const content = <PlayerCard player={player} className="w-full h-full" />

    if (interactive) {
      return (
        <button
          type="button"
          onClick={() => onPlayerTap(player, slot)}
          className={`${base} ${isSelected ? selectedStyles : unselectedStyles} p-0 border-0 bg-transparent`}
        >
          {content}
        </button>
      )
    }
    return <div className={base}>{content}</div>
  }

  return (
    <div className={`flex items-stretch ${className}`}>
      {/* Team 1 — green, trapezoid left */}
      <div
        className={`flex-1 flex flex-col items-center gap-2 py-3 px-2 min-w-0
          border-2 border-retro-green/80 shadow-retro-green-glow
          ${animateClass}`}
        style={{
          clipPath: 'polygon(0 0, 100% 8%, 100% 92%, 0 100%)',
          background:
            'radial-gradient(ellipse 90% 80% at 50% 50%, rgba(0,255,136,0.18) 0%, rgba(0,255,136,0.06) 60%, rgba(0,0,0,0.15) 100%)',
        }}
      >
        <p className="font-mono text-retro-green text-[10px] tracking-widest">TEAM 1</p>
        <div className="flex gap-2 flex-1 w-full min-h-0">
          {team1.map((p) => (
            <PlayerSlot key={p.id} player={p} slot="team1" accent="green" />
          ))}
        </div>
      </div>

      {/* VS — centered */}
      <div
        className={`flex flex-col items-center justify-center px-4 flex-shrink-0
          bg-retro-dark border-y-2 border-retro-pink/50 shadow-retro-pink ${vsAnimate}`}
        style={{ minWidth: 64 }}
      >
        <span
          className="font-display text-retro-pink text-3xl tracking-widest animate-vs-pulse"
          style={{ textShadow: '0 0 20px rgba(255,20,147,0.7), 0 0 6px rgba(255,20,147,0.9)' }}
        >
          VS
        </span>
      </div>

      {/* Team 2 — cyan, trapezoid right */}
      <div
        className={`flex-1 flex flex-col items-center gap-2 py-3 px-2 min-w-0
          border-2 border-retro-cyan/80 shadow-retro-cyan-glow
          ${animateClass2}`}
        style={{
          clipPath: 'polygon(0 8%, 100% 0, 100% 100%, 0 92%)',
          background:
            'radial-gradient(ellipse 90% 80% at 50% 50%, rgba(0,212,255,0.18) 0%, rgba(0,212,255,0.06) 60%, rgba(0,0,0,0.15) 100%)',
        }}
      >
        <p className="font-mono text-retro-cyan text-[10px] tracking-widest">TEAM 2</p>
        <div className="flex gap-2 flex-1 w-full min-h-0">
          {team2.map((p) => (
            <PlayerSlot key={p.id} player={p} slot="team2" accent="cyan" />
          ))}
        </div>
      </div>
    </div>
  )
}
