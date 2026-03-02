import { Router } from 'express'
import { pool } from '../db/index.js'
import { asyncHandler } from '../middleware/asyncHandler.js'

const router = Router()

// GET /api/players
// ?all=true returns active + deleted (for admin)
router.get('/', asyncHandler(async (req, res) => {
  if (req.query.all === 'true') {
    const { rows } = await pool.query('SELECT * FROM players ORDER BY name')
    res.json(rows)
  } else {
    const { rows } = await pool.query(
      'SELECT * FROM players WHERE deleted_at IS NULL ORDER BY name'
    )
    res.json(rows)
  }
}))

// POST /api/players
router.post('/', asyncHandler(async (req, res) => {
  const { name } = req.body
  const { rows } = await pool.query(
    'INSERT INTO players (name) VALUES ($1) RETURNING *',
    [name]
  )
  res.status(201).json(rows[0])
}))

// PATCH /api/players/:id — edit name
router.patch('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params
  const { name } = req.body
  if (!name?.trim()) return res.status(400).json({ error: 'Name is required' })
  const { rows: [player] } = await pool.query(
    'UPDATE players SET name = $1 WHERE id = $2 RETURNING *',
    [name.trim(), id]
  )
  if (!player) return res.status(404).json({ error: 'Player not found' })
  res.json(player)
}))

// DELETE /api/players/:id — soft delete
router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params
  const { rows: [player] } = await pool.query(
    'UPDATE players SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING *',
    [id]
  )
  if (!player) return res.status(404).json({ error: 'Player not found or already deleted' })
  res.json(player)
}))

// POST /api/players/:id/restore
router.post('/:id/restore', asyncHandler(async (req, res) => {
  const { id } = req.params
  const { rows: [player] } = await pool.query(
    'UPDATE players SET deleted_at = NULL WHERE id = $1 AND deleted_at IS NOT NULL RETURNING *',
    [id]
  )
  if (!player) return res.status(404).json({ error: 'Player not found or not deleted' })
  res.json(player)
}))

export default router
