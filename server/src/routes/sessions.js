import { Router } from 'express'
import { pool } from '../db/index.js'
import { pickPlayers, assignTeams, placeArrival, seatNewArrivals, shuffle } from '../lib/rotation.js'
import { asyncHandler } from '../middleware/asyncHandler.js'

const router = Router()

// POST /api/sessions — create session + add players + start first game
router.post('/', asyncHandler(async (req, res) => {
  const { playerIds, mode = 'team' } = req.body
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const { rows: [session] } = await client.query(
      'INSERT INTO sessions (mode) VALUES ($1) RETURNING *',
      [mode]
    )

    for (const pid of shuffle([...playerIds])) {
      await client.query(
        'INSERT INTO session_players (session_id, player_id) VALUES ($1, $2)',
        [session.id, pid]
      )
    }

    await client.query('COMMIT')
    res.status(201).json(session)
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}))

// GET /api/sessions — list all sessions, newest first
router.get('/', asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    'SELECT * FROM sessions ORDER BY started_at DESC'
  )
  res.json(rows)
}))

// DELETE /api/sessions/:id — hard delete (cascades to games, game_players, session_players)
router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params
  const { rows: [session] } = await pool.query(
    'DELETE FROM sessions WHERE id = $1 RETURNING *',
    [id]
  )
  if (!session) return res.status(404).json({ error: 'Not found' })
  res.json({ deleted: true, session })
}))

// GET /api/sessions/active — sessions that haven't ended yet
router.get('/active', asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT s.*,
            COUNT(DISTINCT g.id) FILTER (WHERE g.ended_at IS NOT NULL) AS completed_games,
            json_agg(DISTINCT jsonb_build_object('id', p.id, 'name', p.name)) AS players
     FROM sessions s
     JOIN session_players sp ON sp.session_id = s.id
     JOIN players p ON p.id = sp.player_id
     LEFT JOIN games g ON g.session_id = s.id
     WHERE s.ended_at IS NULL
     GROUP BY s.id
     ORDER BY s.started_at DESC`
  )
  res.json(rows)
}))

// GET /api/sessions/:id
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params
  const { rows: [session] } = await pool.query('SELECT * FROM sessions WHERE id = $1', [id])
  if (!session) return res.status(404).json({ error: 'Not found' })

  const { rows: players } = await pool.query(
    `SELECT p.* FROM players p
     JOIN session_players sp ON sp.player_id = p.id
     WHERE sp.session_id = $1`,
    [id]
  )
  res.json({ ...session, players })
}))

// GET /api/sessions/:id/games — all games (completed + in-progress)
router.get('/:id/games', asyncHandler(async (req, res) => {
  const { id } = req.params
  const { rows: games } = await pool.query(
    `SELECT g.*,
            json_agg(json_build_object('id', p.id, 'name', p.name, 'team', gp.team)
                     ORDER BY gp.team, p.name) AS players
     FROM games g
     JOIN game_players gp ON gp.game_id = g.id
     JOIN players p ON p.id = gp.player_id
     WHERE g.session_id = $1
     GROUP BY g.id
     ORDER BY g.game_number`,
    [id]
  )
  res.json(games)
}))

// GET /api/sessions/:id/current-game
router.get('/:id/current-game', asyncHandler(async (req, res) => {
  const { id } = req.params
  const game = await getCurrentGame(pool, id)
  if (!game) return res.status(404).json({ error: 'No active game' })
  res.json(game)
}))

// GET /api/sessions/:id/proposed-rotation — dry run, no DB writes
router.get('/:id/proposed-rotation', asyncHandler(async (req, res) => {
  const { id } = req.params

  const { rows: [session] } = await pool.query('SELECT * FROM sessions WHERE id = $1', [id])
  if (!session) return res.status(404).json({ error: 'Not found' })

  const { rows: sessionPlayers } = await pool.query(
    `SELECT p.* FROM players p
     JOIN session_players sp ON sp.player_id = p.id
     WHERE sp.session_id = $1`,
    [id]
  )

  if (session.mode === 'duel') {
    const byId = Object.fromEntries(sessionPlayers.map((p) => [p.id, p]))
    const recentGames = await getRecentGames(pool, id, 1)

    if (recentGames.length > 0) {
      const lastGame = recentGames[0]
      const team1Player = lastGame.players.find((p) => p.team === 1)
      const team2Player = lastGame.players.find((p) => p.team === 2)
      const courtIds = new Set([team1Player?.id, team2Player?.id].filter(Boolean))
      const benchIds = sessionPlayers.map((p) => p.id).filter((pid) => !courtIds.has(pid))

      return res.json({
        team1: team1Player ? [byId[team1Player.id]] : [sessionPlayers[0]],
        team2: team2Player ? [byId[team2Player.id]] : [sessionPlayers[1]],
        bench: benchIds.map((pid) => byId[pid]),
      })
    }

    return res.json({
      team1: [sessionPlayers[0]],
      team2: [sessionPlayers[1]],
      bench: sessionPlayers.slice(2).map((p) => p),
    })
  }

  const recentGames = await getRecentGames(pool, id, 2)
  const courtIds = pickPlayers(sessionPlayers, recentGames)
  const { team1: team1Ids, team2: team2Ids } = assignTeams(courtIds, recentGames[0] ?? null)

  const byId = Object.fromEntries(sessionPlayers.map((p) => [p.id, p]))
  const benchIds = shuffle(sessionPlayers.map((p) => p.id).filter((id) => !courtIds.includes(id)))
  const playedIds = await getPlayedIds(pool, id)

  res.json(seatNewArrivals({
    team1: team1Ids.map((pid) => byId[pid]),
    team2: team2Ids.map((pid) => byId[pid]),
    bench: benchIds.map((pid) => byId[pid]),
  }, { recentGames, playedIds }))
}))

// POST /api/sessions/:id/next-game — create game with explicit teams
router.post('/:id/next-game', asyncHandler(async (req, res) => {
  const { id } = req.params
  const { team1, team2 } = req.body // arrays of player IDs

  const { rows: [session] } = await pool.query('SELECT * FROM sessions WHERE id = $1', [id])
  if (!session) return res.status(404).json({ error: 'Not found' })
  const teamSize = session.mode === 'duel' ? 1 : 2

  if (!team1 || !team2 || team1.length !== teamSize || team2.length !== teamSize) {
    return res.status(400).json({ error: `team1 and team2 must each have ${teamSize} player ID(s)` })
  }

  const { rows: sessionPlayerRows } = await pool.query(
    'SELECT player_id FROM session_players WHERE session_id = $1',
    [id]
  )
  const sessionPlayerIds = new Set(sessionPlayerRows.map((r) => r.player_id))
  if ([...team1, ...team2].some((pid) => !sessionPlayerIds.has(pid))) {
    return res.status(400).json({ error: 'One or more players are not in this session' })
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const game = await createGameWithTeams(client, id, team1, team2)
    await client.query('COMMIT')
    res.status(201).json(game)
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}))

// POST /api/sessions/:id/place-arrival — seat a late arrival on the upcoming co-op court
router.post('/:id/place-arrival', asyncHandler(async (req, res) => {
  const { id } = req.params
  const { playerId, team1, team2, bench } = req.body

  const { rows: [session] } = await pool.query('SELECT * FROM sessions WHERE id = $1', [id])
  if (!session) return res.status(404).json({ error: 'Not found' })
  if (session.mode === 'duel') {
    return res.status(400).json({ error: 'Head-to-head keeps late arrivals on the bench' })
  }
  if (!Array.isArray(team1) || !Array.isArray(team2) || team1.length !== 2 || team2.length !== 2) {
    return res.status(400).json({ error: 'team1 and team2 must each have 2 slots' })
  }
  if (!Array.isArray(bench)) {
    return res.status(400).json({ error: 'bench must be a list of player ids' })
  }

  const { rows: sessionPlayers } = await pool.query(
    `SELECT p.* FROM players p
     JOIN session_players sp ON sp.player_id = p.id
     WHERE sp.session_id = $1`,
    [id]
  )
  const byId = Object.fromEntries(sessionPlayers.map((player) => [player.id, player]))
  if (!byId[playerId]) {
    return res.status(400).json({ error: 'Player is not in this session' })
  }

  const mentioned = [...team1, ...team2, ...bench]
  if (mentioned.some((pid) => pid != null && !byId[pid])) {
    return res.status(400).json({ error: 'One or more players are not in this session' })
  }

  const recentGames = await getRecentGames(pool, id, 2)
  const lineup = placeArrival({
    team1: team1.map((pid) => (pid == null ? null : byId[pid])),
    team2: team2.map((pid) => (pid == null ? null : byId[pid])),
    bench: bench.filter((pid) => pid != null).map((pid) => byId[pid]),
    arrival: byId[playerId],
    recentGames,
  })
  res.json(lineup)
}))

// POST /api/sessions/:id/players — add a late arrival
router.post('/:id/players', asyncHandler(async (req, res) => {
  const { id } = req.params
  const { playerId } = req.body

  // Check already in session
  const { rows: existing } = await pool.query(
    'SELECT 1 FROM session_players WHERE session_id = $1 AND player_id = $2',
    [id, playerId]
  )
  if (existing.length > 0) {
    return res.status(409).json({ error: 'Player already in session' })
  }

  await pool.query(
    'INSERT INTO session_players (session_id, player_id) VALUES ($1, $2)',
    [id, playerId]
  )

  const { rows: [player] } = await pool.query('SELECT * FROM players WHERE id = $1', [playerId])
  res.status(201).json(player)
}))

// DELETE /api/sessions/:id/players/:playerId — remove a player from session
router.delete('/:id/players/:playerId', asyncHandler(async (req, res) => {
  const { id, playerId } = req.params

  const { rows: [session] } = await pool.query('SELECT * FROM sessions WHERE id = $1', [id])
  if (!session) return res.status(404).json({ error: 'Not found' })

  const { rowCount } = await pool.query(
    'DELETE FROM session_players WHERE session_id = $1 AND player_id = $2',
    [id, playerId]
  )
  if (rowCount === 0) {
    return res.status(404).json({ error: 'Player not in session' })
  }

  res.status(204).send()
}))

// PATCH /api/sessions/:id/end
router.patch('/:id/end', asyncHandler(async (req, res) => {
  const { id } = req.params
  const { rows: [session] } = await pool.query(
    'UPDATE sessions SET ended_at = NOW() WHERE id = $1 RETURNING *',
    [id]
  )
  res.json(session)
}))

// GET /api/sessions/:id/summary
router.get('/:id/summary', asyncHandler(async (req, res) => {
  const { id } = req.params

  const { rows: games } = await pool.query(
    `SELECT g.*,
            json_agg(json_build_object('id', p.id, 'name', p.name, 'team', gp.team, 'was_winner', gp.was_winner)
                     ORDER BY gp.team) AS players
     FROM games g
     JOIN game_players gp ON gp.game_id = g.id
     JOIN players p ON p.id = gp.player_id
     WHERE g.session_id = $1 AND g.ended_at IS NOT NULL
     GROUP BY g.id
     ORDER BY g.game_number`,
    [id]
  )

  const { rows: sessionPlayers } = await pool.query(
    `SELECT p.* FROM players p
     JOIN session_players sp ON sp.player_id = p.id
     WHERE sp.session_id = $1`,
    [id]
  )

  const playerStats = sessionPlayers.map((p) => {
    let wins = 0
    let losses = 0
    for (const game of games) {
      const gp = game.players.find((x) => x.id === p.id)
      if (!gp) continue
      if (gp.was_winner) wins++
      else losses++
    }
    return { ...p, wins, losses }
  })

  const formatted = games.map((g) => ({
    id: g.id,
    game_number: g.game_number,
    score_team1: g.score_team1,
    score_team2: g.score_team2,
    team1: g.players.filter((p) => p.team === 1),
    team2: g.players.filter((p) => p.team === 2),
  }))

  res.json({ games: formatted, players: playerStats })
}))

// --- helpers ---

async function getPlayedIds(client, sessionId) {
  const { rows } = await client.query(
    `SELECT DISTINCT gp.player_id
     FROM game_players gp
     JOIN games g ON g.id = gp.game_id
     WHERE g.session_id = $1`,
    [sessionId]
  )
  return rows.map((row) => row.player_id)
}

async function getRecentGames(client, sessionId, limit = 2) {
  const { rows: games } = await client.query(
    `SELECT g.id, g.game_number,
            json_agg(json_build_object('id', p.id, 'team', gp.team) ORDER BY gp.team) AS players
     FROM games g
     JOIN game_players gp ON gp.game_id = g.id
     JOIN players p ON p.id = gp.player_id
     WHERE g.session_id = $1
     GROUP BY g.id
     ORDER BY g.game_number DESC
     LIMIT $2`,
    [sessionId, limit]
  )
  return games
}

// Create a game with explicit team assignments and write to DB
async function createGameWithTeams(client, sessionId, team1Ids, team2Ids) {
  const { rows: sessionPlayers } = await client.query(
    `SELECT p.* FROM players p
     JOIN session_players sp ON sp.player_id = p.id
     WHERE sp.session_id = $1`,
    [sessionId]
  )

  const { rows: [{ max: lastNum }] } = await client.query(
    'SELECT MAX(game_number) FROM games WHERE session_id = $1',
    [sessionId]
  )
  const gameNumber = (lastNum ?? 0) + 1

  const { rows: [game] } = await client.query(
    'INSERT INTO games (session_id, game_number) VALUES ($1, $2) RETURNING *',
    [sessionId, gameNumber]
  )

  for (const pid of team1Ids) {
    await client.query(
      'INSERT INTO game_players (game_id, player_id, team) VALUES ($1, $2, 1)',
      [game.id, pid]
    )
  }
  for (const pid of team2Ids) {
    await client.query(
      'INSERT INTO game_players (game_id, player_id, team) VALUES ($1, $2, 2)',
      [game.id, pid]
    )
  }

  const byId = Object.fromEntries(sessionPlayers.map((p) => [p.id, p]))
  const players = [
    ...team1Ids.map((id) => ({ ...byId[id], team: 1 })),
    ...team2Ids.map((id) => ({ ...byId[id], team: 2 })),
  ]
  return { ...game, players }
}

async function getCurrentGame(client, sessionId) {
  const { rows: [game] } = await client.query(
    `SELECT g.* FROM games g
     WHERE g.session_id = $1 AND g.ended_at IS NULL
     ORDER BY g.game_number DESC
     LIMIT 1`,
    [sessionId]
  )
  if (!game) return null

  const { rows: players } = await client.query(
    `SELECT p.*, gp.team FROM players p
     JOIN game_players gp ON gp.player_id = p.id
     WHERE gp.game_id = $1`,
    [game.id]
  )
  return { ...game, players }
}

export default router
