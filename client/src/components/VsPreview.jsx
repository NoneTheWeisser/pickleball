import ArcadeMatchup from './ArcadeMatchup'

/**
 * Arcade-style VS preview — Team 1 (green) vs Team 2 (cyan).
 * Used when players are selected on SessionSetup.
 * Delegates to ArcadeMatchup for consistent layout.
 */
export default function VsPreview({ selected, isDuel, className = '' }) {
  if (!selected?.length) return null

  const team1 = isDuel ? selected.slice(0, 1) : selected.slice(0, Math.ceil(selected.length / 2))
  const team2 = isDuel ? selected.slice(1, 2) : selected.slice(Math.ceil(selected.length / 2))

  return <ArcadeMatchup team1={team1} team2={team2} className={className} animate />
}
