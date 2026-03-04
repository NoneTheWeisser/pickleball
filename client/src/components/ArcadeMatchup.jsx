import AvatarDisplay from './AvatarDisplay'

/**
 * Arcade-style Team 1 vs Team 2 display with trapezoidal panels.
 * Used in GameInProgress and optionally VsPreview.
 */
export default function ArcadeMatchup({ team1, team2, className = '', animate = false }) {
  // Use opacity-0 only during animation; keyframes animate to opacity-1.
  // animation-fill-mode: both ensures 0% state applies before start (during delay).
  const animateClass = animate ? 'animate-slide-in-left' : ''
  const animateClass2 = animate ? 'animate-slide-in-right [animation-delay:100ms]' : ''
  const vsAnimate = animate ? 'animate-vs-pop [animation-delay:150ms]' : ''

  return (
    <div className={`flex items-stretch ${className}`}>
      {/* Team 1 — green, trapezoid left */}
      <div
        className={`flex-1 flex flex-col items-center justify-center gap-2 py-4 px-3 min-w-0
          border-2 border-retro-green/60 bg-retro-green/10
          ${animateClass}`}
        style={{
          clipPath: 'polygon(0 0, 100% 8%, 100% 92%, 0 100%)',
        }}
      >
        <p className="font-mono text-retro-green text-[10px] tracking-widest">TEAM 1</p>
        <div className="flex -space-x-2">
          {team1.map((p) => (
            <AvatarDisplay key={p.id} player={p} size={40} className="ring-2 ring-retro-dark" />
          ))}
        </div>
        <p className="font-display text-lg tracking-wide text-retro-cream truncate max-w-full text-center">
          {team1.map((p) => p.name).join(' & ')}
        </p>
      </div>

      {/* VS — centered */}
      <div
        className={`flex flex-col items-center justify-center px-3 flex-shrink-0
          bg-retro-dark border-y-2 border-retro-pink/50 ${vsAnimate}`}
        style={{ minWidth: 56 }}
      >
        <span
          className="font-display text-retro-pink text-2xl tracking-widest"
          style={{ textShadow: '0 0 12px rgba(255,20,147,0.4)' }}
        >
          VS
        </span>
      </div>

      {/* Team 2 — cyan, trapezoid right */}
      <div
        className={`flex-1 flex flex-col items-center justify-center gap-2 py-4 px-3 min-w-0
          border-2 border-retro-cyan/60 bg-retro-cyan/10
          ${animateClass2}`}
        style={{
          clipPath: 'polygon(0 8%, 100% 0, 100% 100%, 0 92%)',
        }}
      >
        <p className="font-mono text-retro-cyan text-[10px] tracking-widest">TEAM 2</p>
        <div className="flex -space-x-2">
          {team2.map((p) => (
            <AvatarDisplay key={p.id} player={p} size={40} className="ring-2 ring-retro-dark" />
          ))}
        </div>
        <p className="font-display text-lg tracking-wide text-retro-cream truncate max-w-full text-center">
          {team2.map((p) => p.name).join(' & ')}
        </p>
      </div>
    </div>
  )
}
