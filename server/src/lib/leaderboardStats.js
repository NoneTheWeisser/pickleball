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
