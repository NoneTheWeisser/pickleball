import { useMemo } from 'react'
import ArcadeMatchup from './ArcadeMatchup'
import { shuffledCoopTeams } from '../lib/shuffle'

/**
 * Arcade-style VS preview — Team 1 (green) vs Team 2 (cyan).
 * Used when players are selected on SessionSetup.
 * Co-op teams are shuffled so click order does not determine sides.
 */
export default function VsPreview({ selected, isDuel, className = '' }) {
  const selectionKey = selected.map((p) => p.id).sort((a, b) => a - b).join(',')

  const { team1, team2 } = useMemo(() => {
    if (!selected?.length) return { team1: [], team2: [] }
    if (isDuel) {
      return { team1: selected.slice(0, 1), team2: selected.slice(1, 2) }
    }
    return shuffledCoopTeams(selected)
  }, [selectionKey, isDuel, selected])

  if (!selected?.length) return null

  return <ArcadeMatchup team1={team1} team2={team2} className={className} animate />
}
