import { Router } from 'express'
import { pool } from '../db/index.js'
import { asyncHandler } from '../middleware/asyncHandler.js'

const router = Router()

function validateScore(a, b) {
  if (!Number.isInteger(a) || !Number.isInteger(b)) return 'Scores must be whole numbers'
  if (a < 0 || b < 0) return 'Scores must be positive'
  if (a === b) return 'Scores cannot be tied'
  const winner = Math.max(a, b)
  const loser = Math.min(a, b)
  if (winner < 11) return 'Winning score must be at least 11'
  if (winner - loser < 2) return 'Must win by 2'
  return null
}

// PATCH /api/games/:id/score
router.patch('/:id/score', asyncHandler(async (req, res) => {
  const { id } = req.params
  const { score_team1, score_team2 } = req.body

  const error = validateScore(score_team1, score_team2)
  if (error) return res.status(400).json({ error })

  const winner = score_team1 > score_team2 ? 1 : 2

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const { rows: [game] } = await client.query(
      `UPDATE games
       SET score_team1 = $1, score_team2 = $2, ended_at = COALESCE(ended_at, NOW())
       WHERE id = $3
       RETURNING *`,
      [score_team1, score_team2, id]
    )

    await client.query(
      `UPDATE game_players
       SET was_winner = (team = $1)
       WHERE game_id = $2`,
      [winner, id]
    )

    await client.query('COMMIT')
    res.json(game)
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}))

export default router
