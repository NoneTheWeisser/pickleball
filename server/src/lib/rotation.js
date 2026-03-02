/**
 * Determine which 4 players take the court next.
 *
 * Rules:
 *   - Players who played the last 2 consecutive games must sit.
 *   - Players who sat the previous game have priority to play.
 *   - Fill remaining spots randomly from those who played only 1 of the last 2 games.
 */
export function pickPlayers(sessionPlayers, recentGames) {
  const playerIds = sessionPlayers.map((p) => p.id)

  if (recentGames.length === 0) {
    return shuffle(playerIds).slice(0, 4)
  }

  const lastGame = recentGames[0]
  const prevGame = recentGames[1] ?? null

  const lastGameIds = new Set(lastGame.players.map((p) => p.id))
  const prevGameIds = prevGame ? new Set(prevGame.players.map((p) => p.id)) : new Set()

  const playedBoth = playerIds.filter((id) => lastGameIds.has(id) && prevGameIds.has(id))
  const satLast = playerIds.filter((id) => !lastGameIds.has(id))
  const playedOnce = playerIds.filter(
    (id) => !playedBoth.includes(id) && !satLast.includes(id)
  )

  // Must sit: played both recent games
  const mustSit = new Set(playedBoth)

  // Priority pool: sat last game
  const priority = shuffle(satLast.filter((id) => !mustSit.has(id)))

  // Fill pool: played exactly one of the last two games
  const fill = shuffle(playedOnce.filter((id) => !mustSit.has(id)))

  const court = [...priority, ...fill].slice(0, 4)
  return court
}

/**
 * Assign 2v2 teams from 4 player IDs.
 * Avoids repeating the same partner pairing from the previous game.
 */
export function assignTeams(courtIds, previousGame) {
  const prevPairs = previousGame
    ? [
        new Set(previousGame.players.filter((p) => p.team === 1).map((p) => p.id)),
        new Set(previousGame.players.filter((p) => p.team === 2).map((p) => p.id)),
      ]
    : []

  const maxAttempts = 20
  for (let i = 0; i < maxAttempts; i++) {
    const shuffled = shuffle([...courtIds])
    const team1 = [shuffled[0], shuffled[1]]
    const team2 = [shuffled[2], shuffled[3]]

    if (!repeatsPartner(team1, team2, prevPairs)) {
      return { team1, team2 }
    }
  }

  // Fallback: return whatever we have (all pairings exhausted — unlikely with 4 players)
  const shuffled = shuffle([...courtIds])
  return { team1: [shuffled[0], shuffled[1]], team2: [shuffled[2], shuffled[3]] }
}

function repeatsPartner(team1, team2, prevPairs) {
  return prevPairs.some((pair) => {
    return (
      (pair.has(team1[0]) && pair.has(team1[1])) ||
      (pair.has(team2[0]) && pair.has(team2[1]))
    )
  })
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
