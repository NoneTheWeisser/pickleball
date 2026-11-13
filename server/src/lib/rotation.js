/**
 * Determine which 4 players take the court next.
 *
 * Court fills in this order:
 *   1. Players with zero games in this session.
 *   2. Players who sat the previous game.
 *   3. Players who played exactly one of the last two games.
 *   4. Players who played both of the last two games, only to reach 4.
 *
 * Inside a tier, players with fewer games this session come first. Ties are
 * random. gamesPlayed maps player id to games already played; ids missing from
 * it have played zero. recentGames is most-recent first.
 */
export function pickPlayers(sessionPlayers, recentGames, gamesPlayed = new Map()) {
  const playerIds = sessionPlayers.map((p) => p.id)
  const played = gamesPlayed instanceof Map ? gamesPlayed : new Map(gamesPlayed)

  if (recentGames.length === 0) {
    return shuffle(playerIds).slice(0, 4)
  }

  const lastGame = recentGames[0]
  const prevGame = recentGames[1] ?? null
  const lastGameIds = new Set(lastGame.players.map((p) => p.id))
  const prevGameIds = prevGame ? new Set(prevGame.players.map((p) => p.id)) : new Set()
  const count = (id) => played.get(id) ?? 0

  const neverPlayed = playerIds.filter((id) => count(id) === 0)
  const satLast = playerIds.filter((id) => count(id) > 0 && !lastGameIds.has(id))
  const playedBoth = playerIds.filter((id) => lastGameIds.has(id) && prevGameIds.has(id))
  const playedOnce = playerIds.filter((id) => lastGameIds.has(id) && !prevGameIds.has(id))

  return [
    ...orderedByGamesPlayed(neverPlayed, count),
    ...orderedByGamesPlayed(satLast, count),
    ...orderedByGamesPlayed(playedOnce, count),
    ...orderedByGamesPlayed(playedBoth, count),
  ].slice(0, Math.min(4, playerIds.length))
}

function orderedByGamesPlayed(ids, count) {
  const buckets = new Map()
  for (const id of ids) {
    const games = count(id)
    if (!buckets.has(games)) buckets.set(games, [])
    buckets.get(games).push(id)
  }
  const ordered = []
  for (const games of [...buckets.keys()].sort((a, b) => a - b)) {
    ordered.push(...shuffle(buckets.get(games)))
  }
  return ordered
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

/**
 * Put a late arrival on the upcoming co-op court without reshuffling everyone else.
 * An open slot is filled first. Otherwise the arrival takes the slot of the on-court
 * player with the weakest claim: played the last two games, then played the last
 * game, then anyone. Ties are random. Head-to-head lineups are left unchanged and
 * the arrival stays on the bench.
 *
 * recentGames is most-recent first, same shape as pickPlayers.
 */
export function placeArrival({ team1, team2, bench, arrival, recentGames = [] }) {
  const nextTeam1 = [...team1]
  const nextTeam2 = [...team2]
  const nextBench = [...bench]

  if (nextTeam1.length !== 2 || nextTeam2.length !== 2) {
    nextBench.push(arrival)
    return { team1: nextTeam1, team2: nextTeam2, bench: nextBench }
  }

  const slots = [
    { team: nextTeam1, index: 0 },
    { team: nextTeam1, index: 1 },
    { team: nextTeam2, index: 0 },
    { team: nextTeam2, index: 1 },
  ]
  const open = slots.find((slot) => slot.team[slot.index] == null)
  if (open) {
    open.team[open.index] = arrival
    return { team1: nextTeam1, team2: nextTeam2, bench: nextBench }
  }

  const ranked = slots.map((slot) => ({
    ...slot,
    player: slot.team[slot.index],
    rank: courtClaim(slot.team[slot.index].id, recentGames),
  }))
  const weakestRank = Math.min(...ranked.map((slot) => slot.rank))
  const chosen = shuffle(ranked.filter((slot) => slot.rank === weakestRank))[0]
  chosen.team[chosen.index] = arrival
  nextBench.push(chosen.player)
  return { team1: nextTeam1, team2: nextTeam2, bench: nextBench }
}

// Lower rank is bumped first.
function courtClaim(playerId, recentGames) {
  const last = recentGames[0]
  if (!last) return 2
  const lastIds = new Set(last.players.map((player) => player.id))
  const prevIds = recentGames[1]
    ? new Set(recentGames[1].players.map((player) => player.id))
    : new Set()
  if (lastIds.has(playerId) && prevIds.has(playerId)) return 0
  if (lastIds.has(playerId)) return 1
  return 2
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

export { shuffle }
