import { Router } from 'express'
import { pool } from '../db/index.js'

const router = Router()

// PATCH /api/games/:id/score
router.patch('/:id/score', async (req, res) => {
  const { id } = req.params
  const { score_team1, score_team2 } = req.body

  const winner = score_team1 > score_team2 ? 1 : 2

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const { rows: [game] } = await client.query(
      `UPDATE games
       SET score_team1 = $1, score_team2 = $2, ended_at = NOW()
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
})

export default router
