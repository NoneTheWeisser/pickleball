// One player's completed games, oldest first.
// Each game: { wasWinner, team, scoreTeam1, scoreTeam2 }
export function computePlayerStats(games) {
  const totalGames = games.length
  const wins = games.filter((game) => game.wasWinner).length
  const losses = totalGames - wins
  const winPct = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0

  let currentStreak = 0
  if (totalGames > 0) {
    const last = games[totalGames - 1].wasWinner
    for (let i = totalGames - 1; i >= 0; i--) {
      if (games[i].wasWinner === last) {
        currentStreak += last ? 1 : -1
      } else {
        break
      }
    }
  }

  let bestStreak = 0
  let winRun = 0
  for (const game of games) {
    if (game.wasWinner === true) {
      winRun += 1
      if (winRun > bestStreak) bestStreak = winRun
    } else {
      winRun = 0
    }
  }

  let improvement = null
  if (totalGames >= 5) {
    const recent5 = games.slice(-5)
    const recent5Wins = recent5.filter((game) => game.wasWinner).length
    const recent5WinPct = recent5Wins / 5
    improvement = Math.round((recent5WinPct - wins / totalGames) * 100)
  }

  let pointsFor = 0
  let pointsAgainst = 0
  for (const game of games) {
    if (game.team === 1) {
      pointsFor += game.scoreTeam1
      pointsAgainst += game.scoreTeam2
    } else if (game.team === 2) {
      pointsFor += game.scoreTeam2
      pointsAgainst += game.scoreTeam1
    }
  }

  return {
    totalGames,
    wins,
    losses,
    winPct,
    currentStreak,
    bestStreak,
    improvement,
    pointsFor,
    pointsAgainst,
    plusMinus: pointsFor - pointsAgainst,
  }
}

// One completed Co-Op game:
// { team1: [{ id, name }], team2: [{ id, name }], scoreTeam1, scoreTeam2 }
// A side counts only when it has exactly two players. Opponents are not a pair.
export function winningestPairs(games, { minGames = 3, limit = 5 } = {}) {
  const pairs = new Map()

  for (const game of games) {
    const sides = [
      { players: game.team1 ?? [], pointsFor: game.scoreTeam1, pointsAgainst: game.scoreTeam2 },
      { players: game.team2 ?? [], pointsFor: game.scoreTeam2, pointsAgainst: game.scoreTeam1 },
    ]
    for (const side of sides) {
      if (side.players.length !== 2) continue
      const [a, b] = [...side.players].sort((left, right) => (
        left.id < right.id ? -1 : left.id > right.id ? 1 : 0
      ))
      if (a.id === b.id) continue
      const key = `${a.id}:${b.id}`
      let pair = pairs.get(key)
      if (!pair) {
        pair = {
          ids: [a.id, b.id],
          names: [a.name, b.name],
          gamesTogether: 0,
          wins: 0,
          losses: 0,
          pointsFor: 0,
          pointsAgainst: 0,
        }
        pairs.set(key, pair)
      }
      pair.names = [a.name, b.name]
      pair.gamesTogether += 1
      pair.pointsFor += side.pointsFor
      pair.pointsAgainst += side.pointsAgainst
      if (side.pointsFor > side.pointsAgainst) pair.wins += 1
      else if (side.pointsAgainst > side.pointsFor) pair.losses += 1
    }
  }

  return [...pairs.values()]
    .filter((pair) => pair.gamesTogether >= minGames)
    .map((pair) => ({
      ...pair,
      winPct: Math.round((pair.wins / pair.gamesTogether) * 100),
      plusMinus: pair.pointsFor - pair.pointsAgainst,
    }))
    .sort((a, b) => b.wins - a.wins || b.winPct - a.winPct || b.gamesTogether - a.gamesTogether)
    .slice(0, limit)
}

function byId(players) {
  return [...players].sort((left, right) => (left.id < right.id ? -1 : left.id > right.id ? 1 : 0))
}

// Rivalries someone keeps losing, worst first. Co-Op opponents are the two
// players on the other side. Head to Head opponents are the other player.
// Each row is from the winner's side. A tie is left out.
export function nemesisMatchups(games, { minGames = 3 } = {}) {
  const matchups = new Map()

  for (const game of games) {
    const sides = [
      { players: game.team1 ?? [], score: game.scoreTeam1, opponentScore: game.scoreTeam2 },
      { players: game.team2 ?? [], score: game.scoreTeam2, opponentScore: game.scoreTeam1 },
    ]
    for (const side of sides) {
      const other = side === sides[0] ? sides[1] : sides[0]
      const opponents = byId(other.players)
      if (opponents.length !== 1 && opponents.length !== 2) continue
      if (new Set(opponents.map((player) => player.id)).size !== opponents.length) continue
      const opponentKey = opponents.map((player) => player.id).join(':')
      for (const player of side.players) {
        if (opponents.some((opponent) => opponent.id === player.id)) continue
        const key = `${player.id}|${opponentKey}`
        let row = matchups.get(key)
        if (!row) {
          row = { player: { id: player.id, name: player.name }, opponents: [], wins: 0, losses: 0, games: 0 }
          matchups.set(key, row)
        }
        row.player = { id: player.id, name: player.name }
        row.opponents = opponents.map((opponent) => ({ id: opponent.id, name: opponent.name }))
        row.games += 1
        if (side.score > side.opponentScore) row.wins += 1
        else if (side.opponentScore > side.score) row.losses += 1
      }
    }
  }

  return [...matchups.values()]
    .filter((row) => row.games >= minGames && row.losses > row.wins)
    .map((row) => ({
      ...row,
      winPct: Math.round((row.wins / row.games) * 100),
    }))
    .sort((a, b) => (
      b.losses - a.losses
      || a.winPct - b.winPct
      || b.games - a.games
      || (a.player.id < b.player.id ? -1 : a.player.id > b.player.id ? 1 : 0)
    ))
    .map((row) => ({
      ids: row.opponents.map((player) => player.id),
      names: row.opponents.map((player) => player.name),
      wins: row.losses,
      losses: row.wins,
      games: row.games,
      winPct: Math.round((row.losses / row.games) * 100),
      against: row.player.name,
      againstId: row.player.id,
    }))
}

export function nemesisMatchup(games, options) {
  return nemesisMatchups(games, options)[0] ?? null
}
