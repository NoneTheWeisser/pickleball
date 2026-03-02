import { Router } from 'express'
import { logError } from '../lib/logger.js'
import { asyncHandler } from '../middleware/asyncHandler.js'

const router = Router()

// POST /api/client-errors — report client-side errors for server-side logging
router.post('/', asyncHandler(async (req, res) => {
  const { message, stack, context } = req.body
  const err = new Error(message ?? 'Client error')
  if (stack) err.stack = stack
  logError(err, { source: 'client', ...context })
  res.status(204).send()
}))

export default router
