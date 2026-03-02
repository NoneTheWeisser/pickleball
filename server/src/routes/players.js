import { Router } from 'express'
import { pool } from '../db/index.js'
import { asyncHandler } from '../middleware/asyncHandler.js'

const router = Router()

// GET /api/players
router.get('/', asyncHandler(async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM players ORDER BY name')
  res.json(rows)
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

export default router
