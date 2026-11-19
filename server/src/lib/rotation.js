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
 * For each player, avoids the partner from the last game that player was in,
 * even if they sat since then. recentGames is most-recent first. When every
 * pairing repeats someone, the one with the fewest repeats is used.
 */
export function assignTeams(courtIds, recentGames = []) {
  const forbidden = lastPartnerPairs(courtIds, recentGames)
  let best = null
  let bestRepeats = Infinity

  for (const option of partnerOptions(courtIds)) {
    const repeats = repeatedPartnerCount(option.team1, option.team2, forbidden)
    if (repeats < bestRepeats) {
      best = option
      bestRepeats = repeats
    }
  }

  return best
}

function lastPartnerPairs(courtIds, recentGames) {
  const onCourt = new Set(courtIds)
  const pairs = []
  const seen = new Set()

  for (const id of courtIds) {
    const partnerId = lastPartnerId(id, recentGames)
    if (partnerId == null || !onCourt.has(partnerId)) continue
    const key = [id, partnerId].sort((a, b) => a - b).join('-')
    if (seen.has(key)) continue
    seen.add(key)
    pairs.push(new Set([id, partnerId]))
  }

  return pairs
}

function lastPartnerId(playerId, recentGames) {
  for (const game of recentGames) {
    const players = game.players ?? []
    const me = players.find((player) => player.id === playerId)
    if (!me) continue
    const partner = players.find((player) => player.team === me.team && player.id !== playerId)
    return partner?.id ?? null
  }
  return null
}

function partnerOptions(courtIds) {
  const [a, b, c, d] = courtIds
  const matchings = [
    [[a, b], [c, d]],
    [[a, c], [b, d]],
    [[a, d], [b, c]],
  ]

  return shuffle(matchings).map(([left, right]) => {
    const [team1, team2] = shuffle([shuffle(left), shuffle(right)])
    return { team1, team2 }
  })
}

function repeatedPartnerCount(team1, team2, forbidden) {
  return [team1, team2].filter((team) =>
    forbidden.some((pair) => pair.has(team[0]) && pair.has(team[1]))
  ).length
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

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export { shuffle }
