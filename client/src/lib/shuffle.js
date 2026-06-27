/** Fisher–Yates shuffle (returns a new array). */
export function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Random 2v2 split for co-op preview (up to 4 on court). */
export function shuffledCoopTeams(players) {
  const court = shuffle(players).slice(0, Math.min(4, players.length))
  const teams = shuffle(court)
  return {
    team1: teams.slice(0, 2),
    team2: teams.slice(2, 4),
  }
}
