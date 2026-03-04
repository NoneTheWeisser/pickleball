import AvatarDisplay from './AvatarDisplay'

/**
 * Arcade-style VS preview — Team 1 (green) vs Team 2 (cyan).
 * Used when players are selected on SessionSetup.
 */
export default function VsPreview({ selected, isDuel, className = '' }) {
  if (!selected?.length) return null

  const team1 = isDuel ? selected.slice(0, 1) : selected.slice(0, Math.ceil(selected.length / 2))
  const team2 = isDuel ? selected.slice(1, 2) : selected.slice(Math.ceil(selected.length / 2))

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className="flex-1 flex flex-col items-center justify-center gap-1 py-4 px-3
          border-2 border-retro-green/60 bg-retro-green/5 rounded-l"
      >
        <p className="font-mono text-retro-green text-[10px] tracking-widest">TEAM 1</p>
        <div className="flex gap-1 flex-wrap justify-center">
          {team1.map((p) => (
            <AvatarDisplay key={p.id} player={p} size={36} />
          ))}
        </div>
        <p className="font-mono text-retro-cream text-xs truncate max-w-full text-center">
          {team1.map((p) => p.name).join(' & ')}
        </p>
      </div>

      <span className="font-display text-retro-pink text-xl tracking-widest flex-shrink-0">VS</span>

      <div
        className="flex-1 flex flex-col items-center justify-center gap-1 py-4 px-3
          border-2 border-retro-cyan/60 bg-retro-cyan/5 rounded-r"
      >
        <p className="font-mono text-retro-cyan text-[10px] tracking-widest">TEAM 2</p>
        <div className="flex gap-1 flex-wrap justify-center">
          {team2.map((p) => (
            <AvatarDisplay key={p.id} player={p} size={36} />
          ))}
        </div>
        <p className="font-mono text-retro-cream text-xs truncate max-w-full text-center">
          {team2.map((p) => p.name).join(' & ')}
        </p>
      </div>
    </div>
  )
}
