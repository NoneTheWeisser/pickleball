import { Router } from 'express'
import { pool } from '../db/index.js'
import { asyncHandler } from '../middleware/asyncHandler.js'

const router = Router()

// GET /api/leaderboard
router.get('/leaderboard', asyncHandler(async (req, res) => {
  const { rows } = await pool.query(`
    SELECT
      p.id,
      p.name,
      gp.was_winner,
      g.ended_at
    FROM players p
    JOIN game_players gp ON gp.player_id = p.id
    JOIN games g ON g.id = gp.game_id
    WHERE g.ended_at IS NOT NULL
    ORDER BY p.id, g.ended_at ASC
  `)

  // Group rows by player
  const playerMap = new Map()
  for (const row of rows) {
    if (!playerMap.has(row.id)) {
      playerMap.set(row.id, { id: row.id, name: row.name, games: [] })
    }
    playerMap.get(row.id).games.push(row.was_winner)
  }

  // Compute stats per player
  const players = Array.from(playerMap.values()).map(({ id, name, games }) => {
    const totalGames = games.length
    const wins = games.filter(Boolean).length
    const losses = totalGames - wins
    const winPct = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0

    // Current streak: walk from end, count consecutive same outcome
    let currentStreak = 0
    if (totalGames > 0) {
      const last = games[totalGames - 1]
      for (let i = totalGames - 1; i >= 0; i--) {
        if (games[i] === last) {
          currentStreak += last ? 1 : -1
        } else {
          break
        }
      }
    }

    // Improvement: recent 5 win rate vs overall win rate
    let improvement = null
    if (totalGames >= 5) {
      const recent5 = games.slice(-5)
      const recent5Wins = recent5.filter(Boolean).length
      const recent5WinPct = recent5Wins / 5
      improvement = Math.round((recent5WinPct - wins / totalGames) * 100)
    }

    return { id, name, totalGames, wins, losses, winPct, currentStreak, improvement }
  })

  // Sort by wins desc, then winPct desc
  players.sort((a, b) => b.wins - a.wins || b.winPct - a.winPct)

  // KPIs
  const allTimeWinner = players.length
    ? players.reduce((best, p) => (p.wins > best.wins || (p.wins === best.wins && p.winPct > best.winPct)) ? p : best)
    : null

  const hotStreakCandidate = players.filter(p => p.currentStreak > 0)
  const hotStreak = hotStreakCandidate.length
    ? hotStreakCandidate.reduce((best, p) => p.currentStreak > best.currentStreak ? p : best)
    : null

  const improvedCandidates = players.filter(p => p.improvement !== null)
  const mostImproved = improvedCandidates.length
    ? improvedCandidates.reduce((best, p) => p.improvement > best.improvement ? p : best)
    : null

  res.json({
    kpis: {
      allTimeWinner: allTimeWinner
        ? { id: allTimeWinner.id, name: allTimeWinner.name, wins: allTimeWinner.wins, winPct: allTimeWinner.winPct }
        : null,
      hotStreak: hotStreak
        ? { id: hotStreak.id, name: hotStreak.name, currentStreak: hotStreak.currentStreak }
        : null,
      mostImproved: mostImproved
        ? { id: mostImproved.id, name: mostImproved.name, improvement: mostImproved.improvement }
        : null,
    },
    players,
  })
}))

export default router
