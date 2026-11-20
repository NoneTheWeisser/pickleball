import { Router } from 'express'
import { pool } from '../db/index.js'
import { computePlayerStats, winningestPairs } from '../lib/leaderboardStats.js'
import { asyncHandler } from '../middleware/asyncHandler.js'

const router = Router()

// GET /api/leaderboard?mode=team|duel
router.get('/leaderboard', asyncHandler(async (req, res) => {
  const mode = req.query.mode ?? 'team'

  const { rows } = await pool.query(`
    SELECT
      p.id,
      p.name,
      gp.was_winner,
      gp.team,
      g.id AS game_id,
      g.score_team1,
      g.score_team2,
      g.ended_at
    FROM players p
    JOIN game_players gp ON gp.player_id = p.id
    JOIN games g ON g.id = gp.game_id
    JOIN sessions s ON s.id = g.session_id
    WHERE g.ended_at IS NOT NULL AND s.mode = $1
    ORDER BY p.id, g.ended_at ASC
  `, [mode])

  // Group rows by player
  const playerMap = new Map()
  for (const row of rows) {
    if (!playerMap.has(row.id)) {
      playerMap.set(row.id, { id: row.id, name: row.name, games: [] })
    }
    playerMap.get(row.id).games.push({
      wasWinner: row.was_winner,
      team: row.team,
      scoreTeam1: Number(row.score_team1) || 0,
      scoreTeam2: Number(row.score_team2) || 0,
    })
  }

  const players = Array.from(playerMap.values()).map(({ id, name, games }) => ({
    id,
    name,
    ...computePlayerStats(games),
  }))

  // Sort by wins desc, then winPct desc
  players.sort((a, b) => b.wins - a.wins || b.winPct - a.winPct)

  // Longest game KPI
  const { rows: [longestGameRow] } = await pool.query(`
    SELECT
      g.score_team1,
      g.score_team2,
      ROUND(EXTRACT(EPOCH FROM (g.ended_at - g.started_at)) / 60)::int AS duration_min,
      json_agg(json_build_object('name', p.name, 'team', gp.team) ORDER BY gp.team) AS players
    FROM games g
    JOIN sessions s ON s.id = g.session_id
    JOIN game_players gp ON gp.game_id = g.id
    JOIN players p ON p.id = gp.player_id
    WHERE g.ended_at IS NOT NULL AND s.mode = $1
    GROUP BY g.id
    ORDER BY duration_min DESC
    LIMIT 1
  `, [mode])

  const longestGame = longestGameRow
    ? {
        durationMin: longestGameRow.duration_min,
        score: `${longestGameRow.score_team1}–${longestGameRow.score_team2}`,
        team1: longestGameRow.players.filter(p => p.team === 1).map(p => p.name),
        team2: longestGameRow.players.filter(p => p.team === 2).map(p => p.name),
      }
    : null

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

  let pairs
  if (mode === 'team') {
    const gameMap = new Map()
    for (const row of rows) {
      if (!gameMap.has(row.game_id)) {
        gameMap.set(row.game_id, {
          team1: [],
          team2: [],
          scoreTeam1: Number(row.score_team1) || 0,
          scoreTeam2: Number(row.score_team2) || 0,
        })
      }
      const game = gameMap.get(row.game_id)
      const player = { id: row.id, name: row.name }
      if (row.team === 1) game.team1.push(player)
      else if (row.team === 2) game.team2.push(player)
    }
    pairs = winningestPairs([...gameMap.values()])
  }

  res.json({
    ...(mode === 'team' ? { pairs } : {}),
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
      longestGame,
    },
    players,
  })
}))

export default router
